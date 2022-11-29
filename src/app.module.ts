// Imports
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
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
// Config
import config from './config'
import { AuthModule } from './auth/auth.module'
import { ClassroomModule } from './modules/classroom/classroom.module'
import { AwsModule } from './modules/aws/aws.module'
import { BookLifeModule } from './modules/book_life/book_life.module'
import { LibraryModule } from './modules/library/library.module'
import { CollegeModule } from './modules/college/college.module'
import { APP_GUARD } from '@nestjs/core'

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
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
