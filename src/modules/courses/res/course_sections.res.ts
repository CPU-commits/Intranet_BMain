import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Course } from '../entities/course.entity'
import { CourseLetter } from '../entities/course_letter.entity'

export class CourseSectionsRes {
    @ApiProperty({
        type: 'array',
        items: {
            $ref: getSchemaPath(Course),
        },
    })
    courses: Array<Course>

    @ApiProperty({
        type: 'array',
        items: {
            $ref: getSchemaPath(CourseLetter),
        },
    })
    sections: Array<CourseLetter>
}
