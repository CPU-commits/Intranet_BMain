import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Semester } from '../entities/semester.entity'

export class SemestersRes {
    @ApiProperty({
        type: 'array',
        items: {
            $ref: getSchemaPath(Semester),
        },
    })
    semesters: Array<Semester>
}
