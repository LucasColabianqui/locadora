import { CategoriasController } from './categoria.controller';

describe('CategoriasController', () => {
  let controller: CategoriasController;

  beforeEach(() => {
    // Mock simples para teste básico
    controller = new CategoriasController(null);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
