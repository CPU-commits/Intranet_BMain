import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { CourseLetter } from 'src/modules/courses/entities/course_letter.entity'
import { User } from 'src/modules/users/entities/user.entity'

@Schema({ versionKey: false })
export class Assistance {
    @Prop({ type: Types.ObjectId, ref: CourseLetter.name, required: true })
    section: CourseLetter | Types.ObjectId

    @Prop({
        type: [
            {
                student: {
                    type: Types.ObjectId,
                    required: true,
                    ref: User.name,
                },
                assist: {
                    type: Boolean,
                    required: true,
                },
            },
        ],
        required: true,
    })
    assistance: Array<{
        student: User | Types.ObjectId
        assist: boolean
    }>

    @Prop({ required: true, ref: User.name, type: Types.ObjectId })
    auditor: Types.ObjectId | User

    @Prop({ required: true, type: Date })
    date: Date
}

export const AssistanceSchema = SchemaFactory.createForClass(Assistance)
