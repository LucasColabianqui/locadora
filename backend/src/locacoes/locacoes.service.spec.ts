import { LocacoesService } from './locacoes.service';

describe('LocacoesService', () => {
  let service: LocacoesService;

  beforeEach(() => {
    // Mock simples para teste básico
    service = new LocacoesService(null, null, null, null);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
