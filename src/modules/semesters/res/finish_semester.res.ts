import { ApiProperty } from '@nestjs/swagger'
import { CurrentSemesterStatus } from '../models/semester_status.model'

export class FinishSemester {
    @ApiProperty({ example: '2022-08-08T15:32:58.384+00:00' })
    close_date_semester: string

    @ApiProperty({ type: CurrentSemesterStatus })
    semester_status: CurrentSemesterStatus
}

export class FinishSemesterRes {
    @ApiProperty({ type: FinishSemester })
    finish_semester: FinishSemester
}
