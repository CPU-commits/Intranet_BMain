import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { CourseLetter } from '../entities/course_letter.entity'

export class SectionsRes {
    @ApiProperty({
        type: 'array',
        items: {
            $ref: getSchemaPath(CourseLetter),
        },
    })
    sections: Array<CourseLetter>
}
