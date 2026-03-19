import { FuncionariosController } from './funcionario.controller';

describe('FuncionariosController', () => {
  let controller: FuncionariosController;

  beforeEach(() => {
    // Mock simples para teste básico
    controller = new FuncionariosController(null);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
