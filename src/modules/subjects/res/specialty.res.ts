import { ApiProperty } from '@nestjs/swagger'
import { Specialty } from '../entities/specialty.entity'

export class SpecialtyRes {
    @ApiProperty({ type: Specialty })
    specialty: Specialty
}
