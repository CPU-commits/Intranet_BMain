import { ApiProperty } from '@nestjs/swagger'
import { User } from 'src/modules/users/entities/user.entity'

export class ParentRes {
    @ApiProperty({ type: User })
    parent: User
}
