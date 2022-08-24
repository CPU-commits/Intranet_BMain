import { Controller } from '@nestjs/common'
import { MessagePattern } from '@nestjs/microservices'
import { CollegeService } from '../../service/college.service'

@Controller('nats')
export class NatsController {
    constructor(private readonly collegeService: CollegeService) {}

    @MessagePattern('get_college_data')
    async getCollegeDataNats() {
        const collegeData = await this.collegeService.getCollegeData()
        return collegeData
    }
}
