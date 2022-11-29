import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { CourseLetter } from 'src/modules/courses/entities/course_letter.entity'
import { Subject } from 'src/modules/subjects/entities/subject.entity'
import { User } from 'src/modules/users/entities/user.entity'

export class Imparted {
    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(Subject) }],
    })
    subject: Types.ObjectId | Subject

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(CourseLetter) }],
    })
    course: Types.ObjectId | CourseLetter
}

@Schema()
export class Teacher {
    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(User) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    user: Types.ObjectId | User

    @ApiProperty({
        type: 'array',
        items: {
            $ref: getSchemaPath(Imparted),
        },
    })
    @Prop({
        type: [
            {
                subject: {
                    required: true,
                    type: Types.ObjectId,
                    ref: Subject.name,
                },
                course: {
                    required: true,
                    type: Types.ObjectId,
                    ref: 'CourseLetter',
                },
            },
        ],
    })
    imparted: Imparted[]
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher)
