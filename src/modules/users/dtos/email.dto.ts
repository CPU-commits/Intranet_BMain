import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator'

export class EmailDTO {
    @IsEmail()
    @MaxLength(150)
    @IsNotEmpty()
    email: string
}
