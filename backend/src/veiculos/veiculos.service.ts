import { Injectable, NotFoundException, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Veiculo, StatusVeiculo } from './veiculo.entity';
import { Locacao, StatusLocacao } from '../locacoes/locacao.entity';
import { hasDateConflict, validateDateRange } from '../common/utils/date-range.utils';

@Injectable()
export class VeiculosService {
  private readonly logger = new Logger(VeiculosService.name);

  constructor(
    @InjectRepository(Veiculo)
    private readonly repo: Repository<Veiculo>,
    @InjectRepository(Locacao)
    private readonly locacaoRepo: Repository<Locacao>,
  ) {}

  async create(data: Partial<Veiculo>): Promise<Veiculo> {
    try {
      this.logger.debug(`Criando veículo com dados: ${JSON.stringify(data)}`);
      const veiculo = this.repo.create(data);
      return await this.repo.save(veiculo);
    } catch (error) {
      this.logger.error(`Erro ao criar veículo: ${error.message}`, error.stack);
      throw this.handleDatabaseError(error);
    }
  }

  async findAll(): Promise<Veiculo[]> {
    try {
      this.logger.debug('Buscando todos os veículos');
      return await this.repo.find({ relations: ['categoria'] });
    } catch (error) {
      this.logger.error(`Erro ao buscar veículos: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAvailableByDateRange(dataRetirada: Date | string, dataDevolucao: Date | string): Promise<Veiculo[]> {
    try {
      validateDateRange(dataRetirada, dataDevolucao);
      
      this.logger.debug(`Buscando veículos disponíveis entre ${dataRetirada} e ${dataDevolucao}`);

      const veiculos = await this.repo.find({ relations: ['categoria'] });

      const veiculoIds = veiculos.map(v => v.id);

      const locacoes = await this.locacaoRepo.createQueryBuilder('locacao')
        .leftJoinAndSelect('locacao.veiculo', 'veiculo')
        .where('locacao.veiculo.id IN (:...veiculoIds)', { veiculoIds })
        .andWhere('locacao.status = :status', { status: StatusLocacao.ATIVA })
        .getMany();

      const veiculosComConflito = veiculos.filter((veiculo) => {
        return locacoes.some((locacao) => {
          return (
            locacao.veiculo.id === veiculo.id &&
            hasDateConflict(dataRetirada, dataDevolucao, locacao.dataRetirada, locacao.dataDevolucaoPrevista)
          );
        });
      });

      const veiculosDisponiveis = veiculos.filter(
        (veiculo) => !veiculosComConflito.find((v) => v.id === veiculo.id),
      );

      // Filtrar apenas veículos com status DISPONIVEL ou ALUGADO
      // Bloquear: EM_MANUTENCAO, INATIVO, VENDIDO
      const veiculosAptosParaLocacao = veiculosDisponiveis.filter(
        (veiculo) => veiculo.status === StatusVeiculo.DISPONIVEL || veiculo.status === StatusVeiculo.ALUGADO,
      );

      this.logger.debug(`Encontrados ${veiculosAptosParaLocacao.length} veículos disponíveis`);
      return veiculosAptosParaLocacao;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Data de')) {
        this.logger.warn(`Validação de data falhou: ${error.message}`);
        throw new BadRequestException(error.message);
      }
      this.logger.error(`Erro ao buscar veículos disponíveis: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findById(id: number): Promise<Veiculo | null> {
    try {
      this.logger.debug(`Buscando veículo com ID: ${id}`);
      const veiculo = await this.repo.findOne({ where: { id }, relations: ['categoria'] });
      if (!veiculo) {
        this.logger.warn(`Veículo não encontrado: ${id}`);
        throw new NotFoundException(`Veículo com ID ${id} não encontrado`);
      }
      return veiculo;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erro ao buscar veículo ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async update(id: number, data: Partial<Veiculo>): Promise<void> {
    try {
      this.logger.debug(`Atualizando veículo ${id} com dados: ${JSON.stringify(data)}`);
      const veiculo = await this.findById(id);
      if (!veiculo) {
        throw new NotFoundException(`Veículo com ID ${id} não encontrado`);
      }
      await this.repo.update(id, data);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erro ao atualizar veículo ${id}: ${error.message}`, error.stack);
      this.handleDatabaseError(error);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      this.logger.debug(`Removendo veículo com ID: ${id}`);
      const veiculo = await this.findById(id);
      if (!veiculo) {
        throw new NotFoundException(`Veículo com ID ${id} não encontrado`);
      }
      await this.repo.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error(`Erro ao remover veículo ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private handleDatabaseError(error: any) {
    if (error.code === '23505') {
      // Unique constraint violation
      this.logger.warn(`Violação de constraint único: ${error.detail}`);
      throw new BadRequestException('Este veículo já existe');
    }
    if (error.code === '23503') {
      // Foreign key violation
      this.logger.warn(`Violação de chave estrangeira: ${error.detail}`);
      throw new BadRequestException('Referência inválida');
    }
    throw error;
  }
}
