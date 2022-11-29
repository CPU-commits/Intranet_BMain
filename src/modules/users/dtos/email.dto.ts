import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'

export class EmailDTO {
    @ApiProperty({
        maxLength: 150,
        example: 'mail@mail.com',
    })
    @IsEmail()
    @MaxLength(150)
    @IsNotEmpty()
    email: string
}
