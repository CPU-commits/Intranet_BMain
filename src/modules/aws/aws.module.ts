import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import { SchemaFile, File } from './entities/file.entity'
import { AwsService } from './service/aws.service'

@Module({
    imports: [
        MongooseModule.forFeature([
            {
                name: File.name,
                schema: SchemaFile,
            },
        ]),
    ],
    providers: [AwsService],
    exports: [AwsService],
})
export class AwsModule {}
