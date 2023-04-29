import { Type } from 'class-transformer'
import {
    ArrayMinSize,
    IsArray,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator'

export class TransformerDTO {
    @IsString()
    @IsNotEmpty()
    key: string

    @IsString()
    @IsNotEmpty()
    value: string
}

export class ExcelDTO {
    @IsOptional()
    @IsArray()
    @ValidateNested()
    @Type(() => TransformerDTO)
    transformer?: Array<{ key: string; value: string }>

    @IsArray()
    @ArrayMinSize(1)
    @IsString({ each: true })
    @MaxLength(31, { each: true })
    @IsNotEmpty({ each: true })
    sheets: Array<string>
}
