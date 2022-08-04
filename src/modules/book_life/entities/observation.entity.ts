import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { Semester } from 'src/modules/semesters/entities/semester.entity'
import { User } from 'src/modules/users/entities/user.entity'

@Schema()
export class Observation {
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    student: Types.ObjectId | User

    @Prop({ required: true, type: Types.ObjectId, ref: Semester.name })
    semester: Types.ObjectId | Semester

    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    author: Types.ObjectId | User

    @Prop({ required: true })
    type: boolean

    @Prop({ required: true, maxlength: 500 })
    observation: string

    @Prop({ required: true })
    date: Date
}

export const ObservationSchema = SchemaFactory.createForClass(Observation)
