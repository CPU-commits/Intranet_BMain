import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Student } from '../entities/student.entity'

export class StudentsRes {
    @ApiProperty({ type: 'array', items: { $ref: getSchemaPath(Student) } })
    students: Array<Student>

    @ApiProperty()
    total: number
}
