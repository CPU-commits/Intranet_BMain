import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CollegeDTO {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    direction: string

    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    phone: string

    @IsEmail()
    @MaxLength(100)
    @IsNotEmpty()
    email: string
}
