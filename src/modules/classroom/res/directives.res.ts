import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Directive } from '../entities/directive.entity'

export class DirectivesRes {
    @ApiProperty({
        type: 'array',
        items: {
            $ref: getSchemaPath(Directive),
        },
    })
    directives: Array<Directive>
}
