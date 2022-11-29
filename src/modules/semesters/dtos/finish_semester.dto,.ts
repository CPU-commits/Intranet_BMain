import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
    IsArray,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    ValidateNested,
} from 'class-validator'
import { ObjectId } from 'mongodb'

export class VariableSectionStudentDTO {
    @ApiProperty({
        example: '638660ca141aa4ee9faf07e8',
    })
    @IsMongoId()
    @IsNotEmpty()
    student: string

    @ApiProperty({
        example: '638660ca141aa4ee9faf07e8',
    })
    @IsMongoId()
    @IsNotEmpty()
    id_next_section: string
}

export class FinishSemesterDTO {
    @ApiProperty({
        required: false,
        type: 'array',
        items: { type: 'string' },
        example: ['638660ca141aa4ee9faf07e8'],
    })
    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    @IsNotEmpty()
    students_repeat: Array<ObjectId>

    @ApiProperty({
        required: false,
        type: 'array',
        items: { $ref: getSchemaPath(VariableSectionStudentDTO) },
    })
    @IsOptional()
    @IsArray()
    @ValidateNested()
    @Type(() => VariableSectionStudentDTO)
    @IsNotEmpty()
    students_next_courses: Array<VariableSectionStudentDTO>
}
