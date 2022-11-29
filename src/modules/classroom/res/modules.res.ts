import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { ModuleClass } from '../entities/module.entity'

export class ModulesRes {
    @ApiProperty({
        type: 'array',
        items: {
            $ref: getSchemaPath(ModuleClass),
        },
    })
    modules: Array<ModuleClass>
}
