import { Test, TestingModule } from '@nestjs/testing';
import { ClientesController } from './clientes.controller';
import { ClientesService } from './clientes.service';
import { NotFoundException } from '@nestjs/common';

describe('ClientesController', () => {
  let controller: ClientesController;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    const mockService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    moduleRef = await Test.createTestingModule({
      controllers: [ClientesController],
      providers: [{ provide: ClientesService, useValue: mockService }],
    }).compile();

    controller = moduleRef.get<ClientesController>(ClientesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // note: validation is applied via global pipes in main.ts; controller
  // unit test doesn't exercise pipes so we skip direct validation here.

  it('should propagate NotFoundException from service', async () => {
    const service = moduleRef.get<ClientesService>(ClientesService);
    jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException());
    await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
  });
});
