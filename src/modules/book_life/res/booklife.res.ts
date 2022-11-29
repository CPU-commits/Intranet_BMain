import { ApiExtraModels, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Observation } from '../entities/observation.entity'

export class BookLifeRes {
    @ApiExtraModels(Observation)
    @ApiProperty({
        type: 'array',
        items: {
            $ref: getSchemaPath(Observation),
        },
    })
    observations: Array<Observation>
}
