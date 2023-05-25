import { Controller, UseInterceptors } from '@nestjs/common'
import { LoggerInterceptor } from 'src/logger.interceptor'
import { StudentsService } from '../../service/students.service'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { NatsRes } from 'src/models/nats_rest.model'

@UseInterceptors(LoggerInterceptor)
@Controller('nats')
export class NatsController {
    constructor(private readonly studentsService: StudentsService) {}

    @MessagePattern('get_students_from_ids')
    async getStudents(@Payload() idsStudents: Array<string>): Promise<NatsRes> {
        const students = await this.studentsService.getStudentsFromIdsUser(
            idsStudents,
        )
        return {
            success: true,
            data: students,
        }
    }
}
