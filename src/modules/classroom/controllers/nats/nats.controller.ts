import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { GradeConfigKeys } from '../../models/grade_config.model'
import { ClassroomService } from '../../service/classroom.service'

@Controller('nats')
export class NatsController {
    constructor(private readonly classroomService: ClassroomService) {}

    @MessagePattern('get_min_max_grades')
    async getMinMaxGrades() {
        const minMaxGrade = await this.classroomService.getGradeConfig()
        if (!(GradeConfigKeys.MIN in minMaxGrade)) return null
        return {
            min: Number(minMaxGrade[GradeConfigKeys.MIN]),
            max: Number(minMaxGrade[GradeConfigKeys.MAX]),
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
