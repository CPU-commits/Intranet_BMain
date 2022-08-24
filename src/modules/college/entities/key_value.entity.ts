import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ versionKey: false, collection: 'key_value' })
export class KeyValue {
    @Prop({ required: true, unique: true, index: true })
    key: string

    @Prop({ required: true })
    value: string
}

export const KeyValueSchema = SchemaFactory.createForClass(KeyValue)
