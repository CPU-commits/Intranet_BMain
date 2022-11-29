import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Cycle } from 'src/modules/courses/entities/cycle.entity'

export class CyclesRes {
    @ApiProperty({
        type: 'array',
        items: {
            $ref: getSchemaPath(Cycle),
        },
    })
    cycles: Array<Cycle>
}
