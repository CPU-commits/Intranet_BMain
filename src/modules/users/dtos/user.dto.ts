import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'
import { Role } from 'src/auth/models/roles.model'

export class UserDTO {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    first_lastname: string

    @IsString()
    @IsNotEmpty()
    second_lastname: string

    @IsString()
    @MinLength(10)
    @IsNotEmpty()
    rut: string

    @IsEmail()
    email?: string

    user_type: Role
}

export class UpdateUserDTO extends PartialType(UserDTO) {}
