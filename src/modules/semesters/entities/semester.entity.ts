import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'

@Schema()
export class Semester {
    @ApiProperty({
        example: 2002,
    })
    @Prop({ required: true })
    year: number

    @ApiProperty({
        example: 2,
    })
    @Prop({ required: true })
    semester: number

    @ApiProperty({
        example: 0,
        enum: [0, 1, 2],
        description: `0 -> Used.
            1 -> Inactive.
            2 -> Active`,
    })
    /*
        0 = Used
        1 = Inactive
        2 = Active
    */
    @Prop({ default: 1, min: 0, max: 2, type: Number })
    status: number
}

export const SemesterSchema = SchemaFactory.createForClass(Semester)
