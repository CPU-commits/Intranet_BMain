import { ApiProperty, getSchemaPath } from '@nestjs/swagger'

export class DirectivesStatus {
    @ApiProperty({
        example: 'Primera Básico A - Matemáticas',
    })
    module: string

    @ApiProperty()
    status: boolean

    @ApiProperty()
    messages: string[]
}

export class DirectivesStatusRes {
    @ApiProperty({
        type: 'array',
        items: {
            $ref: getSchemaPath(DirectivesStatus),
        },
    })
    directives: Array<DirectivesStatus>
}
