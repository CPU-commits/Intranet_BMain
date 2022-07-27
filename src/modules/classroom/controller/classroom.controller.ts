import { Controller } from '@nestjs/common'
import { MessagePattern, Payload } from '@nestjs/microservices'
import { ClassroomService } from '../service/classroom.service'

@Controller('classroom')
export class ClassroomController {
    constructor(private readonly classroomService: ClassroomService) {}

    @MessagePattern('get_students_from_module')
    async getStudentsFromModule(@Payload() idModule: string) {
        const students = await this.classroomService.getStudentsFromIdModule(
            idModule,
        )
        return students
    }
}
