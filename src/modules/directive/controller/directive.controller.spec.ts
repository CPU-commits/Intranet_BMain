import { Test, TestingModule } from '@nestjs/testing'
import { DirectiveController } from './directive.controller'

describe('DirectiveController', () => {
    let controller: DirectiveController

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [DirectiveController],
        }).compile()

        controller = module.get<DirectiveController>(DirectiveController)
    })

    it('should be defined', () => {
        expect(controller).toBeDefined()
    })
})
