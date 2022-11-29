import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Course } from '../entities/course.entity'

export class CoursesRes {
    @ApiProperty({
        type: 'array',
        items: {
            $ref: getSchemaPath(Course),
        },
    })
    courses: Array<Course>
}
