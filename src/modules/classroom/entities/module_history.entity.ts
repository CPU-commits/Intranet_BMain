import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { Semester } from 'src/modules/semesters/entities/semester.entity'
import { User } from 'src/modules/users/entities/user.entity'
import { ModuleClass } from './module.entity'

@Schema()
export class ModuleHistory {
    @Prop({ required: true, type: [{ type: Types.ObjectId, ref: User.name }] })
    students: Types.Array<Types.ObjectId> | User[]

    @Prop({ required: true, type: Types.ObjectId, ref: ModuleClass.name })
    module: Types.ObjectId | ModuleClass

    @Prop({ required: true, type: Types.ObjectId, ref: Semester.name })
    semester: Types.ObjectId | Semester

    @Prop({ required: true })
    date: Date
}

export const ModuleHistorySchema = SchemaFactory.createForClass(ModuleHistory)
