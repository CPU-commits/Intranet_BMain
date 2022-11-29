import { ApiProperty, getSchemaPath, PartialType } from '@nestjs/swagger'
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
    @ApiProperty({ example: '638660ca141aa4ee9faf07e8' })
    @IsMongoId()
    @IsNotEmpty()
    _id: string

    @ApiProperty({
        maxLength: 50,
        example: 'Chief',
    })
    @IsString()
    @MaxLength(50)
    @IsNotEmpty()
    rol: string
}

export class ListDTO {
    @ApiProperty({
        maxLength: 100,
        example: 'List name',
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    list_name: string

    @ApiProperty({
        type: [StudentListDTO],
        minItems: 2,
    })
    @IsArray()
    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @Type(() => StudentListDTO)
    @IsNotEmpty()
    students: Array<StudentListDTO>
}

export class VotingDTO {
    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    start_date: string

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    finish_date: string

    @ApiProperty({
        minimum: 1,
        type: 'integer',
    })
    @IsInt()
    @Min(1)
    @IsNotEmpty()
    period: number

    @ApiProperty({
        type: 'array',
        minItems: 2,
        items: {
            $ref: getSchemaPath(ListDTO),
        },
    })
    @IsArray()
    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @Type(() => ListDTO)
    @IsNotEmpty()
    lists: Array<ListDTO>
}

// Update
class UpdateListDTO extends ListDTO {
    @ApiProperty({
        required: false,
        example: '638660ca141aa4ee9faf07e8',
    })
    @IsOptional()
    @IsMongoId()
    @IsNotEmpty()
    _id: string
}

export class UpdateVotingDTO extends PartialType(VotingDTO) {
    @ApiProperty({
        required: false,
        minItems: 2,
        type: [UpdateListDTO],
    })
    @IsOptional()
    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @Type(() => UpdateListDTO)
    @IsNotEmpty()
    lists: Array<UpdateListDTO>
}
