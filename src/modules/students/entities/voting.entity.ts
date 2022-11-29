import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { Semester } from 'src/modules/semesters/entities/semester.entity'
import { User } from 'src/modules/users/entities/user.entity'

class StudentList {
    @ApiProperty({ example: '638660ca141aa4ee9faf07e8' })
    _id: string

    @ApiProperty({ example: 'Chief' })
    rol: string
}

export class List {
    @ApiProperty({ example: '638660ca141aa4ee9faf07e8' })
    _id: Types.ObjectId

    @ApiProperty({ example: 'Generic' })
    list_name: string

    @ApiProperty({
        type: [StudentList],
    })
    students: Array<{
        _id: Types.ObjectId
        rol: string
    }>
}

@Schema()
export class Voting {
    @ApiProperty({ example: '2022-08-08T15:32:58.384+00:00' })
    @Prop({ required: true })
    start_date: Date

    @ApiProperty({ example: '2022-08-08T15:32:58.384+00:00' })
    @Prop({ required: true })
    finish_date: Date

    @ApiProperty({
        example: 9,
        description: 'In months',
    })
    @Prop({ required: true })
    period: number

    @ApiProperty({
        type: 'array',
        items: {
            $ref: getSchemaPath(List),
        },
    })
    @Prop({
        required: true,
        type: [
            {
                _id: { type: Types.ObjectId, required: true },
                list_name: { type: String, maxlength: 100, required: true },
                students: {
                    type: [
                        {
                            _id: {
                                type: Types.ObjectId,
                                required: true,
                                ref: User.name,
                            },
                            rol: {
                                type: String,
                                required: true,
                                maxlength: 50,
                            },
                        },
                    ],
                    required: true,
                },
            },
        ],
    })
    lists: Array<List>

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(Semester) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: Semester.name })
    semester: Types.ObjectId | Semester
}

export const VotingSchema = SchemaFactory.createForClass(Voting)
