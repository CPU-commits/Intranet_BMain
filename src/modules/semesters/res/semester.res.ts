import { ApiProperty } from '@nestjs/swagger'
import { Semester } from '../entities/semester.entity'

export class SemesterRes {
    @ApiProperty({ type: Semester })
    semester: Semester
}
