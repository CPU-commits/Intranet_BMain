import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { SemestersService } from '../../service/semesters.service'

@Controller('nats')
export class NatsController {
    constructor(private readonly semesterService: SemestersService) {}

    @MessagePattern('get_valid_semester')
    async getValidSemester() {
        return await this.semesterService.getCurrentSemester()
    }

    @MessagePattern('get_semester')
    async getSemester(@Payload() idSemester: string) {
        return await this.semesterService.getSemesterByID(idSemester)
    }

    @MessagePattern('get_last_semester')
    async getLastSemester(@Payload() idSemester: string) {
        return await this.semesterService.getLastSemester(idSemester)
    }
}
