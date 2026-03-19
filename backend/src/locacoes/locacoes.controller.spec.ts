import { LocacoesController } from './locacoes.controller';

describe('LocacoesController', () => {
  let controller: LocacoesController;

  beforeEach(() => {
    // Mock simples para teste básico
    controller = new LocacoesController(null);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
