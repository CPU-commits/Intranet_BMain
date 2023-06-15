import { Module } from '@nestjs/common'
import { CollegeService } from './service/college.service'
import { CollegeController } from './controllers/college.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { KeyValue, KeyValueSchema } from './entities/key_value.entity'
import { NatsController } from './controllers/nats/nats.controller'
import { Address, SchemaAddress } from './entities/address.entity'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: KeyValue.name,
                schema: KeyValueSchema,
            },
            {
                name: Address.name,
                schema: SchemaAddress,
            },
        ]),
    ],
    providers: [CollegeService],
    controllers: [CollegeController, NatsController],
    exports: [CollegeService],
})
export class CollegeModule {}
