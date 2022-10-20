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
    @IsMongoId()
    @IsNotEmpty()
    student: string

    @IsMongoId()
    @IsNotEmpty()
    id_next_section: string
}

export class FinishSemesterDTO {
    @IsOptional()
    @IsArray()
    @IsMongoId({ each: true })
    @IsNotEmpty()
    students_repeat: Array<ObjectId>

    @IsOptional()
    @IsArray()
    @ValidateNested()
    @Type(() => VariableSectionStudentDTO)
    @IsNotEmpty()
    students_next_courses: Array<VariableSectionStudentDTO>
}
