import { Test, TestingModule } from '@nestjs/testing'
import { BookLifeService } from './book_life.service'

describe('BookLifeService', () => {
    let service: BookLifeService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BookLifeService],
        }).compile()

        service = module.get<BookLifeService>(BookLifeService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
