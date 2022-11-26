import { Test, TestingModule } from '@nestjs/testing'
import { DirectiveService } from './directive.service'

describe('DirectiveService', () => {
    let service: DirectiveService

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [DirectiveService],
        }).compile()

        service = module.get<DirectiveService>(DirectiveService)
    })

    it('should be defined', () => {
        expect(service).toBeDefined()
    })
})
