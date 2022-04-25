import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class Specialty {
    @Prop({ required: true })
    specialty: string
}

export const SpecialtySchema = SchemaFactory.createForClass(Specialty)
