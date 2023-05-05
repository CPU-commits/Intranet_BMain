import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ReportType, ReportTypeKeys } from '../models/report_type.model'
import { Types } from 'mongoose'
import { User } from 'src/modules/users/entities/user.entity'

@Schema()
export class Report {
    @Prop({ required: false, maxlength: 500 })
    description?: string

    @Prop({
        enum: [
            ReportTypeKeys.FUNC,
            ReportTypeKeys.CONFLICT,
            ReportTypeKeys.CONN,
            ReportTypeKeys.FLOW,
            ReportTypeKeys.FORMAT,
            ReportTypeKeys.FREEZE,
            ReportTypeKeys.LOADING,
            ReportTypeKeys.NO_FOLLOW,
            ReportTypeKeys.OTHER,
            ReportTypeKeys.SAVE,
            ReportTypeKeys.UNREADABLE,
        ],
        default: ReportTypeKeys.FUNC,
        type: String,
    })
    type: keyof typeof ReportType

    @Prop({
        required: false,
        type: { message: { type: String }, statusCode: { type: Number } },
    })
    error?: { message: string; statusCode: number }

    @Prop({ type: Types.ObjectId, ref: User.name })
    user: Types.ObjectId | User
}

export const SchemaReport = SchemaFactory.createForClass(Report)
