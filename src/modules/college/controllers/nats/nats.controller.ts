import { Controller, UseInterceptors } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { LoggerInterceptor } from 'src/logger.interceptor'
import { CollegeService } from '../../service/college.service'

@UseInterceptors(LoggerInterceptor)
@Controller('nats')
export class NatsController {
    constructor(private readonly collegeService: CollegeService) {}

    @MessagePattern('get_college_data')
    async getCollegeDataNats() {
        const collegeData = await this.collegeService.getCollegeData()
        return collegeData
    }
}
