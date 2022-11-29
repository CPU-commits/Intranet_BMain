import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { History } from '../entities/history.entity'

export class HistoryRes {
    @ApiProperty({
        type: 'array',
        items: {
            $ref: getSchemaPath(History),
        },
    })
    history: Array<History>
}
