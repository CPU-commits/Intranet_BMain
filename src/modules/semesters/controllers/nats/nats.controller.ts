import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { SemestersService } from '../../service/semesters.service'

@Controller('nats')
export class NatsController {
    constructor(private readonly semesterService: SemestersService) {}

    @MessagePattern('get_valid_semester')
    async getValidSemester() {
        return await this.semesterService.getCurrentSemester()
    }
}
