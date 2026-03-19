import { CategoriasService } from './categoria.service';

describe('CategoriasService', () => {
  let service: CategoriasService;

  beforeEach(() => {
    // Mock simples para teste básico
    service = new CategoriasService(null);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
