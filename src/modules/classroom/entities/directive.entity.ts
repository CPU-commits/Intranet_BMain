import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { ModuleClass } from './module.entity'

class MinGrades {
    @ApiProperty()
    actived: boolean

    @ApiProperty({
        example: 1,
    })
    min_grade: number
}

@Schema()
export class Directive {
    @ApiProperty({
        type: 'string',
        example: '6383c87baafb4c54f37c8eee',
    })
    @Prop({ required: true, type: Types.ObjectId, ref: ModuleClass.name })
    module: Types.ObjectId

    @ApiProperty({
        type: MinGrades,
    })
    @Prop({
        actived: { type: Boolean, required: true },
        min_grade: { type: Number, min: 0 },
    })
    min_grades: MinGrades

    @ApiProperty()
    @Prop()
    continuous: boolean

    @ApiProperty()
    @Prop()
    all_grades: boolean
}

export const DirectiveSchema = SchemaFactory.createForClass(Directive)
