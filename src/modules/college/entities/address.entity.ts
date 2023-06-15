import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema()
export class Address {
    @Prop({ required: true })
    street_number_name: string

    @Prop()
    building_site_number: string

    @Prop()
    city: string

    @Prop()
    postal_code: string

    @Prop({ required: true })
    country: string

    @Prop()
    lat: number

    @Prop()
    lng: number

    @Prop({ default: false })
    is_school: boolean

    @Prop({ required: true, type: Date })
    date: Date
}

export const SchemaAddress = SchemaFactory.createForClass(Address)
