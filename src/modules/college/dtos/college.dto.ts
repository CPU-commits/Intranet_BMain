import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CollegeDTO {
    @ApiProperty({
        maxLength: 100,
        example: '4Th Street',
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    direction: string

    @ApiProperty({
        maxLength: 100,
        example: '912345432',
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    phone: string

    @ApiProperty({
        maxLength: 100,
        example: 'mail@mail.com',
    })
    @IsEmail()
    @MaxLength(100)
    @IsNotEmpty()
    email: string
}
