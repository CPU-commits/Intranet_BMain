import { ApiProperty } from '@nestjs/swagger'

export const CurrentSemesterStatusKey = 'current_semester_status'
export enum SemesterStatus {
    'working',
    'ending',
}

export class CurrentSemesterStatus {
    @ApiProperty()
    key: string

    @ApiProperty({ type: 'string', enum: ['working', 'ending'] })
    value: keyof typeof SemesterStatus
}
