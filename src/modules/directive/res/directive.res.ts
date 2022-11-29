import { ApiProperty } from '@nestjs/swagger'
import { User } from 'src/modules/users/entities/user.entity'

export class DirectiveRes {
    @ApiProperty({ type: User })
    directive: User
}
