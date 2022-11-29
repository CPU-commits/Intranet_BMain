import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { ApiProperty } from '@nestjs/swagger'

@Schema()
export class Specialty {
    @ApiProperty({
        example: 'Tecnology',
    })
    @Prop({ required: true })
    specialty: string
}

export const SpecialtySchema = SchemaFactory.createForClass(Specialty)
