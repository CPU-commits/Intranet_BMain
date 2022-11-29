import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator'
import { Role } from 'src/auth/models/roles.model'
import { ApiProperty, PartialType } from '@nestjs/swagger'

export class UserDTO {
    @ApiProperty({
        maxLength: 100,
        example: 'Karen',
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    name: string

    @ApiProperty({
        maxLength: 100,
        example: 'Rojas',
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    first_lastname: string

    @ApiProperty({
        maxLength: 100,
        example: 'Zapata',
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    second_lastname: string

    @ApiProperty({
        maxLength: 10,
        example: '12345678-9',
    })
    @IsString()
    @MinLength(10)
    @IsNotEmpty()
    rut: string

    @ApiProperty({
        required: false,
        example: 'mail@mail.com',
    })
    @IsOptional()
    @IsEmail()
    email?: string

    user_type: Role
}

export class UpdateUserDTO extends PartialType(UserDTO) {}
