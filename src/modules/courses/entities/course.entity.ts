import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { Subject } from 'src/modules/subjects/entities/subject.entity'
import { CourseLetter } from './course_letter.entity'
import { Cycle } from './cycle.entity'

@Schema()
export class Course {
    @Prop({ required: true, maxlength: 100 })
    course: string

    @Prop({ required: true, unique: true, max: 26, type: Number })
    level: number

    @Prop({ ref: CourseLetter.name, type: [Types.ObjectId] })
    sections: Types.Array<Types.ObjectId> | CourseLetter[]

    @Prop({ required: true, type: Types.ObjectId, ref: Cycle.name })
    cycle: Types.ObjectId | Cycle

    @Prop({ type: [Types.ObjectId], ref: Subject.name })
    subjects: Types.Array<Types.ObjectId> | Subject[]

    @Prop({ default: false })
    isFinal: boolean
}

export const CourseSchema = SchemaFactory.createForClass(Course)
