import { PartialType } from '@nestjs/mapped-types'
import { Type } from 'class-transformer'
import {
    ArrayMinSize,
    IsArray,
    IsDateString,
    IsInt,
    IsMongoId,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    Min,
    ValidateNested,
} from 'class-validator'

class StudentListDTO {
    @IsMongoId()
    @IsNotEmpty()
    _id: string

    @IsString()
    @MaxLength(50)
    @IsNotEmpty()
    rol: string
}

class ListDTO {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    list_name: string

    @IsArray()
    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @Type(() => StudentListDTO)
    @IsNotEmpty()
    students: Array<StudentListDTO>
}

export class VotingDTO {
    @IsDateString()
    @IsNotEmpty()
    start_date: string

    @IsDateString()
    @IsNotEmpty()
    finish_date: string

    @IsInt()
    @Min(1)
    @IsNotEmpty()
    period: number

    @IsArray()
    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @Type(() => ListDTO)
    @IsNotEmpty()
    lists: Array<ListDTO>
}

// Update
class UpdateListDTO extends ListDTO {
    @IsOptional()
    @IsMongoId()
    @IsNotEmpty()
    _id: string
}

export class UpdateVotingDTO extends PartialType(VotingDTO) {
    @IsOptional()
    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @Type(() => UpdateListDTO)
    @IsNotEmpty()
    lists: Array<UpdateListDTO>
}
