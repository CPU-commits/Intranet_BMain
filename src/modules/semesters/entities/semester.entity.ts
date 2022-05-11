import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class Semester {
    @Prop({ required: true })
    year: number

    @Prop({ required: true })
    semester: number
    /*
        0 = Used
        1 = Inactive
        2 = Active
    */
    @Prop({ default: 1, min: 0, max: 2, type: Number })
    status: number
}

export const SemesterSchema = SchemaFactory.createForClass(Semester)
