import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'
import { Role } from 'src/auth/models/roles.model'

@Schema({ versionKey: false })
export class User {
    @ApiProperty({
        example: 'Karen',
    })
    @Prop({ required: true, maxlength: 100 })
    name: string

    @ApiProperty({
        example: 'Rojas',
    })
    @Prop({ required: true, maxlength: 100 })
    first_lastname: string

    @ApiProperty({
        example: 'Molina',
    })
    @Prop({ required: true, maxlength: 100 })
    second_lastname: string

    @Prop({ required: true })
    password: string

    @ApiProperty({
        example: '12345678-9',
    })
    @Prop({ required: true, unique: true })
    rut: string

    @ApiProperty({
        example: 'a',
        enum: ['a', 'b', 'c', 'd', 'e', 'f'],
        description: `a -> Student.
            b -> Student_directive
            c -> Attorney
            d -> Teacher
            e -> Director
            f -> Librarian`,
    })
    @Prop({
        required: true,
        enum: [
            Role.STUDENT,
            Role.STUDENT_DIRECTIVE,
            Role.ATTORNEY,
            Role.TEACHER,
            Role.DIRECTIVE,
            Role.DIRECTOR,
            Role.LIBRARIAN,
        ],
    })
    user_type: string

    @ApiProperty({
        example: 1,
        enum: [1, 2, 3],
        description: `1 -> Active.
            0 -> Inactive
            2 -> Finished`,
    })
    @Prop({ default: 1, isInteger: true, min: 0 })
    status: number

    @ApiProperty({
        example: 'example@mail.com',
        required: false,
    })
    @Prop()
    email?: string
}

export const UserSchema = SchemaFactory.createForClass(User)
UserSchema.index(
    { email: 1 },
    {
        unique: true,
        partialFilterExpression: { email: { $type: 'string' } },
    },
)
