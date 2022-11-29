import { ApiProperty } from '@nestjs/swagger'
import { Specialty } from '../entities/specialty.entity'

export class SpecialtiesRes {
    @ApiProperty({ type: [Specialty] })
    specialties: Array<Specialty>
}
