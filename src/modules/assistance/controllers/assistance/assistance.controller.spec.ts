import { Test, TestingModule } from '@nestjs/testing';
import { AssistanceController } from './assistance.controller';

describe('AssistanceController', () => {
  let controller: AssistanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssistanceController],
    }).compile();

    controller = module.get<AssistanceController>(AssistanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
