import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'
import config from './config'
import { ResApi } from './models/res.model'
import { Observation } from './modules/book_life/entities/observation.entity'
import { User } from './modules/users/entities/user.entity'
import { Semester } from './modules/semesters/entities/semester.entity'
import { Directive } from './modules/classroom/entities/directive.entity'
import { DirectivesStatus } from './modules/classroom/res/directives_status.res'
import { File } from './modules/aws/entities/file.entity'
import { Course } from './modules/courses/entities/course.entity'
import { CourseLetter } from './modules/courses/entities/course_letter.entity'
import { Imparted, Teacher } from './modules/teachers/entities/teacher.entity'
import { Specialty } from './modules/subjects/entities/specialty.entity'
import {
    ModuleClass,
    SubSection,
} from './modules/classroom/entities/module.entity'
import { Cycle } from './modules/courses/entities/cycle.entity'
import { Subject } from './modules/subjects/entities/subject.entity'
import { History } from './modules/history/entities/history.entity'
import { FinishSemester } from './modules/semesters/res/finish_semester.res'
import { CurrentSemesterStatus } from './modules/semesters/models/semester_status.model'
import { RepeatingStudent } from './modules/semesters/entities/repeating_student.entity'
import { VariableSectionStudentDTO } from './modules/semesters/dtos/finish_semester.dto,'
import { Student } from './modules/students/entities/student.entity'
import { List } from './modules/students/entities/voting.entity'
import { Vote } from './modules/students/entities/vote.entity'
import { ListDTO } from './modules/students/dtos/voting.dto'
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston'

async function bootstrap() {
    // Config
    const configService = config()
    // App
    const app = await NestFactory.create(AppModule)
    // Logger
    app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER))
    // NATS Microservice
    app.connectMicroservice<MicroserviceOptions>({
        transport: Transport.NATS,
        options: {
            servers: [`nats://${configService.nats}:4222`],
        },
    })
    await app.startAllMicroservices()
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    )
    const httpClient = `http://${configService.client_url}`
    const httpsClient = `https://${configService.client_url}`
    app.enableCors({
        origin: [httpClient, httpsClient],
        methods: ['GET', 'PUT', 'POST', 'DELETE'],
        credentials: true,
        allowedHeaders: '*',
    })
    // Helmet
    app.use(
        helmet({
            contentSecurityPolicy: false,
        }),
    )
    // Csurf
    // app.use(csruf())
    // Swagger
    const configDocs = new DocumentBuilder()
        .setTitle('Main API')
        .setVersion('1.0')
        .setDescription('API Server For Main service')
        .setTermsOfService('http://swagger.io/terms/')
        .setContact(
            'API Support',
            'http://www.swagger.io/support',
            'support@swagger.io',
        )
        .setLicense(
            'Apache 2.0',
            'http://www.apache.org/licenses/LICENSE-2.0.html',
        )
        .setBasePath('/api/l')
        .addServer('http://localhost:3000')
        .addTag('Main', 'Main Service')
        .addBearerAuth()
        .build()
    const docuement = SwaggerModule.createDocument(app, configDocs, {
        extraModels: [
            ResApi,
            Observation,
            User,
            Semester,
            Directive,
            DirectivesStatus,
            File,
            Course,
            CourseLetter,
            Teacher,
            Specialty,
            Subject,
            SubSection,
            ModuleClass,
            Imparted,
            Cycle,
            History,
            FinishSemester,
            CurrentSemesterStatus,
            RepeatingStudent,
            VariableSectionStudentDTO,
            Student,
            List,
            Vote,
            ListDTO,
        ],
    })
    SwaggerModule.setup('/api/docs', app, docuement)
    await app.listen(3000)
}
bootstrap()
