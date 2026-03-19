import { Test, TestingModule } from '@nestjs/testing';
import { VeiculosController } from './veiculos.controller';
import { VeiculosService } from './veiculos.service';

describe('VeiculosController', () => {
  let controller: VeiculosController;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [VeiculosController],
      providers: [
        {
          provide: VeiculosService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<VeiculosController>(VeiculosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
