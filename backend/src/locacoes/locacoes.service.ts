import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Locacao, StatusLocacao } from './locacao.entity';
import { Cliente } from '../domain/clientes/cliente.entity';
import { Veiculo, StatusVeiculo } from '../veiculos/veiculo.entity';
import { Funcionario } from '../funcionario/funcionario.entity';
import { hasDateConflict, validateDateRange } from '../common/utils/date-range.utils';

@Injectable()
export class LocacoesService {
  private readonly logger = new Logger(LocacoesService.name);

  constructor(
    @InjectRepository(Locacao)
    private readonly locacaoRepo: Repository<Locacao>,
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
    @InjectRepository(Veiculo)
    private readonly veiculoRepo: Repository<Veiculo>,
    @InjectRepository(Funcionario)
    private readonly funcionarioRepo: Repository<Funcionario>,
  ) {}

  async create(data: {
    clienteId: number;
    veiculoId: number;
    funcionarioId: number;
    dataRetirada: Date;
    dataDevolucaoPrevista: Date;
    valorPrevisto: number;
  }): Promise<Locacao> {
    try {
      this.logger.debug(`Criando locação com dados: ${JSON.stringify(data)}`);

      // Validar valorPrevisto
      if (data.valorPrevisto === null || data.valorPrevisto === undefined) {
        this.logger.error(`Valor previsto nulo/undefined: ${data.valorPrevisto}`);
        throw new BadRequestException('Valor previsto é obrigatório');
      }

      const valorNum = Number(data.valorPrevisto);
      if (isNaN(valorNum) || valorNum <= 0) {
        this.logger.error(`Valor previsto inválido: ${data.valorPrevisto} (convertido para ${valorNum})`);
        throw new BadRequestException(`Valor previsto deve ser um número maior que zero. Recebido: ${data.valorPrevisto}`);
      }

      const cliente = await this.clienteRepo.findOneBy({ id: data.clienteId });
      if (!cliente) {
        this.logger.warn(`Cliente não encontrado: ${data.clienteId}`);
        throw new NotFoundException('Cliente não encontrado');
      }

      const veiculo = await this.veiculoRepo.findOneBy({ id: data.veiculoId });
      if (!veiculo) {
        this.logger.warn(`Veículo não encontrado: ${data.veiculoId}`);
        throw new NotFoundException('Veículo não encontrado');
      }

      const funcionario = await this.funcionarioRepo.findOneBy({
        id: data.funcionarioId,
      });
      if (!funcionario) {
        this.logger.warn(`Funcionário não encontrado: ${data.funcionarioId}`);
        throw new NotFoundException('Funcionário não encontrado');
      }

      // Validar datas
      validateDateRange(data.dataRetirada, data.dataDevolucaoPrevista);

      // Buscar locações ativas do veículo que possam conflitar
      const locacoesAtivas = await this.locacaoRepo.find({
        where: {
          veiculo: { id: data.veiculoId },
          status: StatusLocacao.ATIVA,
        },
      });

      const temConflito = locacoesAtivas.some((locacao) =>
        hasDateConflict(
          data.dataRetirada,
          data.dataDevolucaoPrevista,
          locacao.dataRetirada,
          locacao.dataDevolucaoPrevista,
        ),
      );

      if (temConflito) {
        this.logger.warn(
          `Veículo ${data.veiculoId} tem conflito de datas no período solicitado`,
        );
        throw new BadRequestException(
          'Veículo não está disponível no período solicitado',
        );
      }

      const locacao = this.locacaoRepo.create({
        cliente,
        veiculo,
        funcionario,
        dataRetirada: new Date(data.dataRetirada),
        dataDevolucaoPrevista: new Date(data.dataDevolucaoPrevista),
        valorPrevisto: data.valorPrevisto,
        status: StatusLocacao.ATIVA,
      });

      // Atualizar status do veículo
      veiculo.status = StatusVeiculo.ALUGADO;
      await this.veiculoRepo.save(veiculo);

      const resultado = await this.locacaoRepo.save(locacao);
      this.logger.log(`Locação criada com sucesso: ${resultado.id}`);
      return resultado;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Erro ao criar locação: ${error.message}`, error.stack);
      throw new BadRequestException('Erro ao processar locação');
    }
  }

  async findAll(): Promise<Locacao[]> {
    try {
      this.logger.debug('Buscando todas as locações');
      return await this.locacaoRepo.find({
        relations: ['cliente', 'veiculo', 'funcionario'],
      });
    } catch (error) {
      this.logger.error(`Erro ao buscar locações: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findById(id: number): Promise<Locacao | null> {
    try {
      this.logger.debug(`Buscando locação com ID: ${id}`);
      const locacao = await this.locacaoRepo.findOne({
        where: { id },
        relations: ['cliente', 'veiculo', 'funcionario'],
      });
      if (!locacao) {
        this.logger.warn(`Locação não encontrada: ${id}`);
        throw new NotFoundException(`Locação com ID ${id} não encontrada`);
      }
      return locacao;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erro ao buscar locação ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async finalizar(id: number, valorFinal: number): Promise<void> {
    try {
      this.logger.debug(`Finalizando locação ${id} com valor: ${valorFinal}`);
      const locacao = await this.findById(id);
      
      if (!locacao) {
        throw new NotFoundException(`Locação com ID ${id} não encontrada`);
      }

      if (locacao.status === StatusLocacao.FINALIZADA) {
        this.logger.warn(`Tentativa de finalizar locação já finalizada: ${id}`);
        throw new BadRequestException('Esta locação já foi finalizada');
      }

      locacao.dataDevolucaoEfetiva = new Date();
      locacao.valorFinal = valorFinal;
      locacao.status = StatusLocacao.FINALIZADA;
      await this.locacaoRepo.save(locacao);

      // Liberar veículo
      locacao.veiculo.status = StatusVeiculo.DISPONIVEL;
      await this.veiculoRepo.save(locacao.veiculo);

      this.logger.log(`Locação finalizada com sucesso: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(`Erro ao finalizar locação ${id}: ${error.message}`, error.stack);
      throw new BadRequestException('Erro ao finalizar locação');
    }
  }

  async delete(id: number): Promise<void> {
    try {
      this.logger.debug(`Removendo locação com ID: ${id}`);
      const locacao = await this.findById(id);
      
      if (!locacao) {
        throw new NotFoundException(`Locação com ID ${id} não encontrada`);
      }

      if (locacao.status === StatusLocacao.ATIVA) {
        locacao.veiculo.status = StatusVeiculo.DISPONIVEL;
        await this.veiculoRepo.save(locacao.veiculo);
      }

      await this.locacaoRepo.delete(id);
      this.logger.log(`Locação removida com sucesso: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erro ao remover locação ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}
