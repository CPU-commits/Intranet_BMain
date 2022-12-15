import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { User } from 'src/modules/users/entities/user.entity'

@Schema()
export class Auth {
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    user: User | Types.ObjectId

    @Prop({ required: true })
    refresh_token: string

    @Prop({ required: true, default: 0 })
    uses: number

    @Prop({ required: true, type: Date })
    last_session: Date
}

export const AuthShema = SchemaFactory.createForClass(Auth)
