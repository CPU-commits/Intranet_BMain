import {
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator'

export class SubjectDTO {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    subject: string

    @IsOptional()
    @IsMongoId()
    @IsNotEmpty()
    specialty: string
}
