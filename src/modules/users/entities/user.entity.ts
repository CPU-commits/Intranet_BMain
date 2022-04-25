import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Role } from 'src/auth/models/roles.model'

@Schema()
export class User {
    @Prop({ required: true })
    name: string

    @Prop({ required: true })
    first_lastname: string

    @Prop({ required: true })
    second_lastname: string

    @Prop({ required: true })
    password: string

    @Prop({ required: true, unique: true })
    rut: string

    @Prop({
        required: true,
        enum: [
            Role.STUDENT,
            Role.STUDENT_DIRECTIVE,
            Role.ATTORNEY,
            Role.TEACHER,
            Role.DIRECTIVE,
            Role.DIRECTOR,
        ],
    })
    user_type: string

    @Prop({ default: 1 })
    status: number

    @Prop({ unique: true })
    email?: string
}

export const UserSchema = SchemaFactory.createForClass(User)
