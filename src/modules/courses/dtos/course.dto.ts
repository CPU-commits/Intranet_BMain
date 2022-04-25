import { PartialType } from '@nestjs/mapped-types'
import {
    IsBoolean,
    IsInt,
    IsMongoId,
    IsNotEmpty,
    IsPositive,
    IsString,
    Max,
    MaxLength,
} from 'class-validator'

export class CourseDTO {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    course: string

    @IsMongoId()
    @IsNotEmpty()
    cycle: string

    @IsInt()
    @IsPositive()
    @Max(26)
    @IsNotEmpty()
    level: number
}

export class UpdateCourseDTO extends PartialType(CourseDTO) {
    @IsBoolean()
    @IsNotEmpty()
    isFinal: boolean
}
