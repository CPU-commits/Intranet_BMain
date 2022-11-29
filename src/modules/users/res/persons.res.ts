import { ApiProperty } from '@nestjs/swagger'
import { User } from '../entities/user.entity'

export class PersonsRes {
    @ApiProperty({ type: User })
    persons: Array<User>
}
