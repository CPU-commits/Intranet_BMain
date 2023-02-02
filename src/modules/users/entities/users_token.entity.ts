import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { PermissionsKeys } from '../models/permissions.model'
import { User } from './user.entity'

@Schema({ collection: 'users_tokens' })
export class UsersToken {
    @Prop({ type: Types.ObjectId, ref: User.name })
    user: Types.ObjectId | User

    @Prop()
    token: string

    @Prop()
    permissions: Array<keyof typeof PermissionsKeys>

    @Prop({ type: Date })
    expired_at: Date
}

export const UsersTokenSchema = SchemaFactory.createForClass(UsersToken)
