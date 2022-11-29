import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { File } from 'src/modules/aws/entities/file.entity'
import { Teacher } from 'src/modules/teachers/entities/teacher.entity'
import { Course } from './course.entity'

@Schema()
export class CourseLetter {
    @ApiProperty({
        example: 'A',
    })
    @Prop({ required: true })
    section: string

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(File) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: File.name })
    file: Types.ObjectId | File

    @ApiProperty({
        oneOf: [
            { type: 'string' },
            {
                $ref: getSchemaPath(Teacher),
            },
        ],
    })
    @Prop({ type: Types.ObjectId, ref: 'Teacher' })
    header_teacher: Types.ObjectId | Teacher

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(Course) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: 'Course' })
    course: Types.ObjectId | Course

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(CourseLetter) }],
    })
    @Prop({ type: Types.ObjectId, ref: CourseLetter.name })
    next_section: Types.ObjectId | CourseLetter

    @ApiProperty()
    @Prop({ default: false })
    is_next_section_variable: boolean

    @ApiProperty()
    @Prop({ default: true })
    status: boolean

    @ApiProperty({
        example: '2022-08-08T15:32:58.384+00:00',
    })
    @Prop({ type: Date })
    date: Date
}

export const CourseLetterSchema = SchemaFactory.createForClass(CourseLetter)
CourseLetterSchema.index(
    { header_teacher: 1 },
    {
        unique: true,
        partialFilterExpression: { header_teacher: { $type: 'string' } },
    },
)
