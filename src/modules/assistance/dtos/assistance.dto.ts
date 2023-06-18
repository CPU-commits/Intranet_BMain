import { Type } from 'class-transformer'
import {
    IsArray,
    IsBoolean,
    IsDateString,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator'

class AssistanceStudentDTO {
    @IsString()
    @IsMongoId()
    @IsNotEmpty()
    student: string

    @IsBoolean()
    @IsNotEmpty()
    assist: boolean
}

export class AssistanceDTO {
    @IsArray()
    @ValidateNested()
    @Type(() => AssistanceStudentDTO)
    @IsNotEmpty()
    assistance: Array<AssistanceStudentDTO>

    @IsOptional()
    @IsDateString()
    @IsNotEmpty()
    date?: string
}
