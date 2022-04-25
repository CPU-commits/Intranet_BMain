import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class SpecialtyDTO {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    specialty: string
}
