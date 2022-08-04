import { PartialType } from '@nestjs/mapped-types'
import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class ObservationDTO {
    @IsString()
    @MaxLength(500)
    @IsNotEmpty()
    observation: string

    @IsBoolean()
    @IsNotEmpty()
    type: boolean
}

export class UpdateObservationDTO extends PartialType(ObservationDTO) {}
