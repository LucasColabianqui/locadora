import { Injectable, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Funcionario } from '../funcionario/funcionario.entity';

interface AuthUser {
  id: number;
  nome: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Funcionario)
    private readonly funcionarioRepository: Repository<Funcionario>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthUser | null> {
    const user = await this.funcionarioRepository.findOne({ where: { email } });
    // bcrypt.compare has loose types, ignore lint warnings
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    if (user && (await bcrypt.compare(password, user.senha))) {
      // strip senha before returning
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { senha, ...result } = user;
      return result as AuthUser;
    }
    return null;
  }

  login(user: AuthUser) {
    const payload = { email: user.email, sub: user.id, nome: user.nome };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
      },
    };
  }

  async register(nome: string, email: string, senha: string): Promise<AuthUser> {
    // Validações básicas
    if (!nome || !email || !senha) {
      throw new BadRequestException('Nome, email e senha são obrigatórios');
    }

    if (senha.length < 6) {
      throw new BadRequestException('Senha deve ter no mínimo 6 caracteres');
    }

    // Verificar se email já existe
    const existingUser = await this.funcionarioRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado no sistema');
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(senha, 10);

    // Criar novo funcionário
    const newFuncionario = this.funcionarioRepository.create({
      nome,
      email,
      senha: hashedPassword,
    });

    const savedFuncionario = await this.funcionarioRepository.save(
      newFuncionario,
    );

    // Retornar sem a senha
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { senha: _, ...result } = savedFuncionario;
    return result as AuthUser;
  }
}
