import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class WhyDTO {
    @IsString()
    @MaxLength(535)
    @MinLength(1)
    @IsNotEmpty()
    why: string
}
