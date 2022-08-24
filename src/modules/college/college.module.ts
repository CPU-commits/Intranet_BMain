import { Module } from '@nestjs/common'
import { CollegeService } from './service/college.service'
import { CollegeController } from './controllers/college.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { KeyValue, KeyValueSchema } from './entities/key_value.entity'
import { NatsController } from './controllers/nats/nats.controller'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: KeyValue.name,
                schema: KeyValueSchema,
            },
        ]),
    ],
    providers: [CollegeService],
    controllers: [CollegeController, NatsController],
})
export class CollegeModule {}
