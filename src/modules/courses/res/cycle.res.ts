import { ApiProperty } from '@nestjs/swagger'
import { Cycle } from 'src/modules/courses/entities/cycle.entity'

export class CycleRes {
    @ApiProperty({ type: Cycle })
    cycle: Cycle
}
