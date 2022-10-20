import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'

import { Specialty } from './specialty.entity'

@Schema()
export class Subject {
    @Prop({ required: true })
    subject: string

    @Prop({ type: Types.ObjectId, ref: Specialty.name })
    specialty: Types.ObjectId | Specialty

    @Prop({ default: true })
    status: boolean
}

export const SubjectSchema = SchemaFactory.createForClass(Subject)
