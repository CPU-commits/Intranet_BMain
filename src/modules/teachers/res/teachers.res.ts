import { ApiProperty } from '@nestjs/swagger'
import { Teacher } from '../entities/teacher.entity'

export class TeachersRes {
    @ApiProperty({ type: [Teacher] })
    users: Array<Teacher>

    @ApiProperty()
    total: number
}
