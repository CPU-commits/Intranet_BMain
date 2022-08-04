import { Test, TestingModule } from '@nestjs/testing';
import { BookLifeController } from './book_life.controller';

describe('BookLifeController', () => {
  let controller: BookLifeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BookLifeController],
    }).compile();

    controller = module.get<BookLifeController>(BookLifeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
