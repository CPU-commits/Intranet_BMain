import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
} from '@nestjs/common'
import { ClientProxy } from '@nestjs/microservices'
import { InjectModel } from '@nestjs/mongoose'
import { ObjectId } from 'mongodb'
import { Model } from 'mongoose'
import { lastValueFrom } from 'rxjs'
import { Course } from 'src/modules/courses/entities/course.entity'
import { CourseLetter } from 'src/modules/courses/entities/course_letter.entity'
import { Subject } from 'src/modules/subjects/entities/subject.entity'
import { DirectiveDTO } from '../dtos/directive.dto'
import { Directive } from '../entities/directive.entity'
import { ClassroomService } from './classroom.service'

@Injectable()
export class DirectivesService {
    constructor(
        @InjectModel(Directive.name)
        private readonly directiveModel: Model<Directive>,
        @Inject(forwardRef(() => ClassroomService))
        private readonly classroomService: ClassroomService,
        @Inject('NATS_CLIENT') private readonly natsClient: ClientProxy,
    ) {}

    async getDirectiveModule(idModule: ObjectId) {
        return await this.directiveModel
            .findOne({
                module: idModule,
            })
            .exec()
    }

    async getDirectivesStatus() {
        const modules = await this.classroomService.getModulesCurrentSemester()
        const directivesStatus = await Promise.all(
            modules.map(async (_module) => {
                const section = _module.section as CourseLetter
                const course = section.course as Course
                const subject = _module.subject as Subject
                const moduleName = `${course.course} ${section.section}° - ${subject.subject}`

                const directive = await this.getDirectiveModule(_module._id)
                if (directive) {
                    const validateDirectives: {
                        success: boolean
                        messages: Array<string>
                    } = await lastValueFrom(
                        this.natsClient.send(
                            'validate_directives_module',
                            directive,
                        ),
                    )
                    return {
                        module: moduleName,
                        status: validateDirectives.success,
                        messages: validateDirectives.messages,
                    }
                }
                return {
                    module: moduleName,
                    status: true,
                }
            }),
        )
        return directivesStatus
    }

    async addDirectiveModule(directive: DirectiveDTO, idModule: string) {
        if (
            directive.all_grades === undefined &&
            directive.continuous === undefined &&
            directive.min_grades === undefined
        )
            throw new BadRequestException('Se requiere mínimo una directiva')
        const module = await this.classroomService.getModuleFromId(idModule)
        if (!module || module?.status)
            throw new BadRequestException(
                'Este módulo no existe o ya no está disponible de actualizar sus directivas',
            )
        const idObjModule = new ObjectId(idModule)
        const directiveData = await this.getDirectiveModule(idObjModule)
        if (!directiveData) {
            const newDirective = new this.directiveModel({
                ...directive,
                module: idObjModule,
            })
            return await newDirective.save()
        } else {
            return await this.directiveModel
                .findOneAndUpdate(
                    {
                        module: idObjModule,
                    },
                    { $set: { ...directive, module: idObjModule } },
                    { new: true },
                )
                .exec()
        }
    }
}
