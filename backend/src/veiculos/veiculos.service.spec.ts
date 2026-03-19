import { VeiculosService } from './veiculos.service';

describe('VeiculosService', () => {
  let service: VeiculosService;

  beforeEach(() => {
    // Mock simples para teste básico
    service = new VeiculosService(null, null);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
