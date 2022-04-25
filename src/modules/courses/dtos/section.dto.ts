import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class SectionDTO {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    section: string
}
