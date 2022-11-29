import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { Subject } from 'src/modules/subjects/entities/subject.entity'
import { CourseLetter } from './course_letter.entity'
import { Cycle } from './cycle.entity'

@Schema()
export class Course {
    @ApiProperty({
        example: 'Primero básico',
    })
    @Prop({ required: true, maxlength: 100 })
    course: string

    @ApiProperty({
        example: 1,
    })
    @Prop({ required: true, unique: true, max: 26, type: Number })
    level: number

    @ApiProperty({
        oneOf: [
            { type: 'array', items: { type: 'string' } },
            { type: 'array', items: { $ref: getSchemaPath(CourseLetter) } },
        ],
    })
    @Prop({ ref: 'CourseLetter', type: [Types.ObjectId] })
    sections: Types.Array<Types.ObjectId> | CourseLetter[]

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(Cycle) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: Cycle.name })
    cycle: Types.ObjectId | Cycle

    @ApiProperty({
        oneOf: [
            { type: 'array', items: { type: 'string' } },
            { type: 'array', items: { $ref: getSchemaPath(Subject) } },
        ],
    })
    @Prop({ type: [Types.ObjectId], ref: Subject.name })
    subjects: Types.Array<Types.ObjectId> | Subject[]

    @ApiProperty()
    @Prop({ default: false })
    isFinal: boolean
}

export const CourseSchema = SchemaFactory.createForClass(Course)
