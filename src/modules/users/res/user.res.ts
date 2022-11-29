import { ApiProperty } from '@nestjs/swagger'
import { User } from '../entities/user.entity'

export class UserRes {
    @ApiProperty({ type: User })
    user: User
}
