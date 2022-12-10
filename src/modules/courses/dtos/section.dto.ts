import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class SectionDTO {
    @ApiProperty({
        maxLength: 100,
        example: 'A',
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    section: string

    @ApiProperty({ type: 'string', format: 'binary' })
    image: any
}
