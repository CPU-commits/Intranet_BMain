import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { User } from 'src/modules/users/entities/user.entity'

class RefreshToken {
    token: string
    uses: number
}

@Schema()
export class Auth {
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    user: User | Types.ObjectId

    @Prop({
        required: true,
        type: [
            {
                token: { type: String, required: true },
                uses: { type: Number, required: true },
            },
        ],
    })
    refresh_tokens: Array<RefreshToken>

    @Prop({ required: true, type: Date })
    last_session: Date
}

export const AuthShema = SchemaFactory.createForClass(Auth)
