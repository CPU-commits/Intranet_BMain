import { ApiProperty } from '@nestjs/swagger'
import {
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator'

export class SubjectDTO {
    @ApiProperty({
        maxLength: 100,
        example: 'Math',
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    subject: string

    @ApiProperty({
        required: false,
        example: '638660ca141aa4ee9faf07e8',
    })
    @IsOptional()
    @IsMongoId()
    @IsNotEmpty()
    specialty: string
}
