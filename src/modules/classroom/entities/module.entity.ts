import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types } from 'mongoose'
import { CourseLetter } from 'src/modules/courses/entities/course_letter.entity'
import { Semester } from 'src/modules/semesters/entities/semester.entity'
import { Subject } from 'src/modules/subjects/entities/subject.entity'

@Schema()
export class ModuleClass {
    @Prop({ required: true, type: Types.ObjectId, ref: CourseLetter.name })
    section: Types.ObjectId | CourseLetter

    @Prop({ required: true, type: Types.ObjectId, ref: Subject.name })
    subject: Types.ObjectId | Subject

    @Prop({ required: true, type: Types.ObjectId, ref: Semester.name })
    semester: Types.ObjectId | Semester

    /*
        0 = Not finished
        1 = Finished
    */
    @Prop({ default: false, type: Boolean })
    status: boolean
}

export const ModuleClassSchema = SchemaFactory.createForClass(ModuleClass)
