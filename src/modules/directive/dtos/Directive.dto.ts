import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

export class WhyDTO {
    @ApiProperty({
        maxLength: 535,
        minLength: 1,
        example: 'Because...',
    })
    @IsString()
    @MaxLength(535)
    @MinLength(1)
    @IsNotEmpty()
    why: string
}
