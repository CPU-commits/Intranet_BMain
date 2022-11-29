import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { Types } from 'mongoose'
import { CourseLetter } from 'src/modules/courses/entities/course_letter.entity'
import { Semester } from 'src/modules/semesters/entities/semester.entity'
import { Subject } from 'src/modules/subjects/entities/subject.entity'

export class SubSection {
    @ApiProperty({ type: 'string' })
    _id: Types.ObjectId

    @ApiProperty({ example: 'Sub section 1°' })
    name: string
}

@Schema()
export class ModuleClass {
    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(CourseLetter) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: CourseLetter.name })
    section: Types.ObjectId | CourseLetter

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(Subject) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: Subject.name })
    subject: Types.ObjectId | Subject

    @ApiProperty({
        oneOf: [{ type: 'string' }, { $ref: getSchemaPath(Semester) }],
    })
    @Prop({ required: true, type: Types.ObjectId, ref: Semester.name })
    semester: Types.ObjectId | Semester

    /*
        0 = Not finished
        1 = Finished
    */
    @ApiProperty({
        enum: [0, 1],
    })
    @Prop({ default: false, type: Boolean })
    status: boolean

    @ApiProperty({
        type: 'array',
        items: {
            $ref: getSchemaPath(SubSection),
        },
    })
    @Prop({
        type: [
            {
                _id: {
                    type: Types.ObjectId,
                },
                name: {
                    required: true,
                    type: String,
                    maxlength: 100,
                    minlength: 3,
                },
            },
        ],
    })
    sub_sections: Types.Array<SubSection>
}

export const ModuleClassSchema = SchemaFactory.createForClass(ModuleClass)
