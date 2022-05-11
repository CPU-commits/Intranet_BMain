import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
/*import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify'*/
//import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { AppModule } from './app.module'

async function bootstrap() {
    // App
    const app = await NestFactory.create(
        AppModule,
        //new FastifyAdapter(),
    )
    // NATS Microservice
    /*
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.NATS,
        options: {
            servers: ['nats://nats:4222'],
        },
    })
    await app.startAllMicroservices()*/
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    )
    app.enableCors({
        origin: '*',
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
    })
    await app.listen(3000)
}
bootstrap()
