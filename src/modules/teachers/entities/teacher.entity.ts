import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { CourseLetter } from 'src/modules/courses/entities/course_letter.entity'
import { Subject } from 'src/modules/subjects/entities/subject.entity'
import { User } from 'src/modules/users/entities/user.entity'

export class Imparted {
    subject: Types.ObjectId | Subject
    course: Types.ObjectId | CourseLetter
}

@Schema()
export class Teacher {
    @Prop({ required: true, type: Types.ObjectId, ref: User.name })
    user: Types.ObjectId | User

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
                    ref: CourseLetter.name,
                },
            },
        ],
    })
    imparted: Imparted[]
}

export const TeacherSchema = SchemaFactory.createForClass(Teacher)
