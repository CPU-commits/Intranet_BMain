import { ApiProperty } from '@nestjs/swagger'
import { Observation } from '../entities/observation.entity'

export class ObservationRes {
    @ApiProperty()
    observation: Observation
}
