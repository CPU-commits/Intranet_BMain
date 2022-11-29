import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'

import { Specialty } from './specialty.entity'

@Schema()
export class Subject {
    @ApiProperty({
        example: 'Math',
    })
    @Prop({ required: true })
    subject: string

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(Specialty) }],
    })
    @Prop({ type: Types.ObjectId, ref: Specialty.name })
    specialty: Types.ObjectId | Specialty

    @Prop({ default: true })
    status: boolean
}

export const SubjectSchema = SchemaFactory.createForClass(Subject)
