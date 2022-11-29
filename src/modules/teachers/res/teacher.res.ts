import { ApiProperty } from '@nestjs/swagger'
import { Teacher } from '../entities/teacher.entity'

export class TeacherRes {
    @ApiProperty({ type: Teacher })
    teacher: Teacher
}
