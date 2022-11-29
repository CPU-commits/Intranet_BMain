import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CycleDTO {
    @ApiProperty({
        maxLength: 100,
        example: '1st',
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    cycle: string
}
