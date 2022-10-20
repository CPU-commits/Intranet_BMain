import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { ModuleClass } from './module.entity'

class MinGrades {
    actived: boolean
    min_grade: number
}

@Schema()
export class Directive {
    @Prop({ required: true, type: Types.ObjectId, ref: ModuleClass.name })
    module: Types.ObjectId

    @Prop({
        actived: { type: Boolean, required: true },
        min_grade: { type: Number, min: 0 },
    })
    min_grades: MinGrades

    @Prop()
    continuous: boolean

    @Prop()
    all_grades: boolean
}

export const DirectiveSchema = SchemaFactory.createForClass(Directive)
