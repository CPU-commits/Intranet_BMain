import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class ObservationDTO {
    @ApiProperty({
        maxLength: 500,
    })
    @IsString()
    @MaxLength(500)
    @IsNotEmpty()
    observation: string

    @ApiProperty()
    @IsBoolean()
    @IsNotEmpty()
    type: boolean
}

export class UpdateObservationDTO extends PartialType(ObservationDTO) {}
