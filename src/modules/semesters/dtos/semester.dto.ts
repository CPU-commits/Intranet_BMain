import { IsNotEmpty, IsNumber } from 'class-validator'
import { ApiProperty, PartialType } from '@nestjs/swagger'

export class SemesterDTO {
    @ApiProperty({
        example: 2002,
    })
    @IsNumber()
    @IsNotEmpty()
    year: number

    @ApiProperty({
        example: 2,
    })
    @IsNumber()
    @IsNotEmpty()
    semester: number
}

export class SemesterUpdateDTO extends PartialType(SemesterDTO) {}
