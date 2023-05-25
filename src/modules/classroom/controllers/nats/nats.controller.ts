import { Controller, NotFoundException, UseInterceptors } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { LoggerInterceptor } from 'src/logger.interceptor'
import { GradeConfigKeys } from '../../models/grade_config.model'
import { ClassroomService } from '../../service/classroom.service'
import { NatsRes } from 'src/models/nats_rest.model'

@UseInterceptors(LoggerInterceptor)
@Controller('nats')
export class NatsController {
    constructor(private readonly classroomService: ClassroomService) {}

    @MessagePattern('get_min_max_grades')
    async getMinMaxGrades(): Promise<NatsRes> {
        const minMaxGrade = await this.classroomService.getGradeConfig()
        if (!(GradeConfigKeys.MIN in minMaxGrade))
            throw new NotFoundException(
                'no están configurados las calificaciones mínimas y máximas',
            )
        return {
            success: true,
            data: {
                min: Number(minMaxGrade[GradeConfigKeys.MIN]),
                max: Number(minMaxGrade[GradeConfigKeys.MAX]),
            },
        }
    }

    @MessagePattern('get_students_from_module')
    async getStudentsFromModule(@Payload() idModule: string) {
        const students = await this.classroomService.getStudentsFromIdModule(
            idModule,
        )
        return students
    }

    @MessagePattern('get_students_by_course')
    async getStudentsByCourse(@Payload() idCourse: string) {
        const students = await this.classroomService.getStudentsByIdCourse(
            idCourse,
        )
        return students
    }
}
