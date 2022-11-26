import { Test, TestingModule } from '@nestjs/testing'
import { DirectivesController } from './directives.controller'

describe('DirectivesController', () => {
    let controller: DirectivesController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DirectivesController],
        }).compile()

        controller = module.get<DirectivesController>(DirectivesController)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })
})
