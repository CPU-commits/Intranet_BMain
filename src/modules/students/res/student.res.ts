import { ApiProperty } from '@nestjs/swagger'
import { Student } from '../entities/student.entity'

export class StudentRes {
    @ApiProperty({ type: Student })
    student: Student
}
