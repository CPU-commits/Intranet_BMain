import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'
import { Role } from 'src/auth/models/roles.model'

export class UserDTO {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    name: string

    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    first_lastname: string

    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    second_lastname: string

    @IsString()
    @MinLength(10)
    @IsNotEmpty()
    rut: string

    @IsOptional()
    @IsEmail()
    email?: string

    user_type: Role
}

export class UpdateUserDTO extends PartialType(UserDTO) {}
