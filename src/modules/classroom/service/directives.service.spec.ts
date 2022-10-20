import { Test, TestingModule } from '@nestjs/testing';
import { DirectivesService } from './directives.service';

describe('DirectivesService', () => {
  let service: DirectivesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DirectivesService],
    }).compile();

    service = module.get<DirectivesService>(DirectivesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
