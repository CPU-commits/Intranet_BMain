import { Type } from 'class-transformer'
import {
    IsBoolean,
    IsInt,
    IsNotEmpty,
    IsOptional,
    Min,
    ValidateNested,
} from 'class-validator'

class MinGradesDTO {
    @IsBoolean()
    @IsNotEmpty()
    actived: boolean

    @IsOptional()
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    min_grade: number
}

export class DirectiveDTO {
    @IsOptional()
    @ValidateNested()
    @Type(() => MinGradesDTO)
    @IsNotEmpty()
    min_grades: MinGradesDTO

    @IsOptional()
    @IsBoolean()
    @IsNotEmpty()
    continuous: boolean

    @IsOptional()
    @IsBoolean()
    @IsNotEmpty()
    all_grades: boolean
}
