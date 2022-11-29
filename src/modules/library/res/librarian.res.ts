import { ApiProperty } from '@nestjs/swagger'
import { User } from 'src/modules/users/entities/user.entity'

export class LibrarianRes {
    @ApiProperty({ type: User })
    librarian: User
}
