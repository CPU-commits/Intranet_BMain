// Imports
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigModule, ConfigType } from '@nestjs/config'
import * as Joi from 'joi'
// Modules
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { CoursesModule } from './modules/courses/courses.module'
import { StudentsModule } from './modules/students/students.module'
import { TeachersModule } from './modules/teachers/teachers.module'
import { SubjectsModule } from './modules/subjects/subjects.module'
import { SemestersModule } from './modules/semesters/semesters.module'
import { UsersModule } from './modules/users/users.module'
import { DatabaseModule } from './database/database.module'
import { DirectiveModule } from './modules/directive/directive.module'
import { HistoryModule } from './modules/history/history.module'
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'
import { WinstonModule } from 'nest-winston'
import * as winston from 'winston'
// Config
import config from './config'
import { AuthModule } from './auth/auth.module'
import { ClassroomModule } from './modules/classroom/classroom.module'
import { AwsModule } from './modules/aws/aws.module'
import { BookLifeModule } from './modules/book_life/book_life.module'
import { LibraryModule } from './modules/library/library.module'
import { CollegeModule } from './modules/college/college.module'
import { APP_GUARD } from '@nestjs/core'
import { MainController } from './main/main.controller'
import { CorrelationIdMiddleware } from './correlation-id.middleware'
import { MulterModule } from '@nestjs/platform-express'
import { MAX_FILES, MAX_FILE_SIZE } from './common/max_size_file'
import { FilesModule } from './modules/files/files.module'
import { ReportsModule } from './modules/reports/reports.module'
import { ParentsModule } from './modules/parents/parents.module'
import { AssistanceModule } from './modules/assistance/assistance.module'

@Module({
    imports: [
        CoursesModule,
        StudentsModule,
        TeachersModule,
        SubjectsModule,
        SemestersModule,
        ConfigModule.forRoot({
            envFilePath: '.env',
            load: [config],
            isGlobal: true,
            validationSchema: Joi.object({
                JWT_SECRET_KEY: Joi.string().required(),
                JWT_REFRESH_KEY: Joi.string().required(),
                MONGO_DB: Joi.string().required(),
                MONGO_ROOT_USERNAME: Joi.string().required(),
                MONGO_ROOT_PASSWORD: Joi.string().required(),
                MONGO_PORT: Joi.number().required(),
                MONGO_HOST: Joi.string().required(),
                MONGO_CONNECTION: Joi.string().required(),
                NODE_ENV: Joi.string().required(),
                NATS_HOST: Joi.string().required(),
                AWS_BUCKET: Joi.string().required(),
                AWS_ACCESS_KEY_ID: Joi.string().required(),
                AWS_SECRET_ACCESS_KEY: Joi.string().required(),
                CLIENT_URL: Joi.string().required(),
            }),
        }),
        UsersModule,
        DatabaseModule,
        DirectiveModule,
        HistoryModule,
        AuthModule,
        ClassroomModule,
        AwsModule,
        BookLifeModule,
        LibraryModule,
        CollegeModule,
        ThrottlerModule.forRoot({
            ttl: 1,
            limit: 7,
        }),
        MulterModule.register({
            limits: {
                fileSize: MAX_FILE_SIZE,
                files: MAX_FILES,
            },
        }),
        WinstonModule.forRootAsync({
            useFactory: (configService: ConfigType<typeof config>) => {
                const { timestamp, json, combine, simple } = winston.format
                const transports: Array<winston.transport> = [
                    new winston.transports.File({
                        filename: 'error.log',
                        level: 'error',
                        dirname: `${process.cwd()}/logs`,
                        maxsize: 10000000,
                        maxFiles: 2,
                    }),
                    new winston.transports.File({
                        filename: 'combined.log',
                        dirname: `${process.cwd()}/logs`,
                        maxsize: 10000000,
                        maxFiles: 3,
                        level: 'info',
                        format: combine(json(), timestamp()),
                    }),
                ]
                if (configService.node_env !== 'prod')
                    transports.push(
                        new winston.transports.Console({
                            format: combine(simple(), timestamp()),
                        }),
                    )
                return {
                    transports,
                    format: combine(timestamp(), json()),
                }
            },
            inject: [config.KEY],
        }),
        FilesModule,
        ReportsModule,
        ParentsModule,
        AssistanceModule,
    ],
    controllers: [AppController, MainController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(CorrelationIdMiddleware).forRoutes('*')
    }
}
