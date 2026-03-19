import { FuncionariosService } from './funcionario.service';

describe('FuncionariosService', () => {
  let service: FuncionariosService;

  beforeEach(() => {
    // Mock simples para teste básico
    service = new FuncionariosService(null);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
