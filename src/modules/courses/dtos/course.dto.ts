import { ApiProperty, PartialType } from '@nestjs/swagger'
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
    @ApiProperty({
        maxLength: 100,
        example: 'Primero básico',
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    course: string

    @ApiProperty({
        description: 'Mongo ID',
    })
    @IsMongoId()
    @IsNotEmpty()
    cycle: string

    @ApiProperty({
        type: 'integer',
        maximum: 26,
        minimum: 1,
        description: 'Positive',
    })
    @IsInt()
    @IsPositive()
    @Max(26)
    @IsNotEmpty()
    level: number
}

export class UpdateCourseDTO extends PartialType(CourseDTO) {
    @ApiProperty()
    @IsBoolean()
    @IsNotEmpty()
    isFinal: boolean
}
