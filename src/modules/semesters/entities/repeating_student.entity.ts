import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { User } from 'src/modules/users/entities/user.entity'
import { Semester } from './semester.entity'

@Schema()
export class RepeatingStudent {
    @Prop({ required: true, type: Types.ObjectId, ref: Semester.name })
    semester: Types.ObjectId | Semester

    @Prop({
        required: true,
        type: [{ type: Types.ObjectId, ref: User.name }],
    })
    students: Types.Array<Types.ObjectId> | User[]

    @Prop({ required: true })
    date: Date
}

export const RepeatingStudentSchema =
    SchemaFactory.createForClass(RepeatingStudent)
