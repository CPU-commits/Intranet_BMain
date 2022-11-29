import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class SpecialtyDTO {
    @ApiProperty({
        maxLength: 100,
        example: 'Tecnology',
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    specialty: string
}
