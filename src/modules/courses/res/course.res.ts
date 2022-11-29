import { ApiProperty } from '@nestjs/swagger'
import { Course } from '../entities/course.entity'

export class CourseRes {
    @ApiProperty()
    course: Course
}
