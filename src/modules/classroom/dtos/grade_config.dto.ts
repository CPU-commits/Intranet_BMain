import { ApiProperty } from '@nestjs/swagger'
import { IsInt, IsNotEmpty, Min } from 'class-validator'

export class GradeConfigDTO {
    @ApiProperty({
        type: 'integer',
        minimum: 0,
        example: '45',
    })
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    min: number

    @ApiProperty({
        type: 'integer',
        minimum: 0,
        example: '50',
    })
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    max: number
}
