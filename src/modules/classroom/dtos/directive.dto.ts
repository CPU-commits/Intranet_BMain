import { ApiProperty } from '@nestjs/swagger'
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
    @ApiProperty()
    @IsBoolean()
    @IsNotEmpty()
    actived: boolean

    @ApiProperty({
        type: 'integer',
        minimum: 0,
    })
    @IsOptional()
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    min_grade: number
}

export class DirectiveDTO {
    @ApiProperty()
    @IsOptional()
    @ValidateNested()
    @Type(() => MinGradesDTO)
    @IsNotEmpty()
    min_grades: MinGradesDTO

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    @IsNotEmpty()
    continuous: boolean

    @ApiProperty()
    @IsOptional()
    @IsBoolean()
    @IsNotEmpty()
    all_grades: boolean
}
