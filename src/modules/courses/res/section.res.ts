import { ApiProperty } from '@nestjs/swagger'
import { CourseLetter } from '../entities/course_letter.entity'

export class SectionRes {
    @ApiProperty({
        type: CourseLetter,
    })
    section: CourseLetter
}
