import { IsNotEmpty, IsNumber } from 'class-validator'
import { PartialType } from '@nestjs/mapped-types'

export class SemesterDTO {
    @IsNumber()
    @IsNotEmpty()
    year: number

    @IsNumber()
    @IsNotEmpty()
    semester: number
}

export class SemesterUpdateDTO extends PartialType(SemesterDTO) {}
