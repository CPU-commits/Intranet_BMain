import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { RepeatingStudent } from '../entities/repeating_student.entity'

export class RepeatingStudentRes {
    @ApiProperty({
        type: 'array',
        items: {
            $ref: getSchemaPath(RepeatingStudent),
        },
    })
    students: Array<RepeatingStudent>
}
