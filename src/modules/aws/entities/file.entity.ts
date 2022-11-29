import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { User } from 'src/modules/users/entities/user.entity'

@Schema()
export class File {
    @ApiProperty({
        example: 'originalfilename.pdf',
    })
    @Prop({ required: true })
    filename: string

    @ApiProperty({
        example: '$Ffdt542!d',
    })
    @Prop({ required: true })
    key: string

    @ApiProperty({
        example: 'https://example.com/file/$Ffdt542!d',
    })
    @Prop({ required: true })
    url: string

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(User) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    user: Types.ObjectId | User

    @ApiProperty({
        example: 'User title name',
    })
    @Prop({ required: true, maxlength: 100 })
    title: string

    @ApiProperty({
        example: 'application/pdf',
    })
    @Prop({ required: true })
    type: string

    @Prop({ default: true })
    status: boolean

    @ApiProperty({
        example: 'private',
        enum: ['private', 'public', 'public_classroom'],
    })
    @Prop({
        enum: ['private', 'public', 'public_classroom'],
        default: 'private',
    })
    permissions: string

    @ApiProperty({
        example: '2022-08-08T15:32:58.384+00:00',
    })
    @Prop({ required: true, type: Date })
    date: string
}

export const SchemaFile = SchemaFactory.createForClass(File)
