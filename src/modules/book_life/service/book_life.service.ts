import {
    BadRequestException,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Observation } from '../entities/observation.entity'
import { Model } from 'mongoose'
import { ObservationDTO, UpdateObservationDTO } from '../dtos/observation.dto'
import { UsersService } from 'src/modules/users/services/users/users.service'
import { Role } from 'src/auth/models/roles.model'
import { SemestersService } from 'src/modules/semesters/service/semesters.service'
import { User } from 'src/modules/users/entities/user.entity'
import { PayloadToken } from 'src/auth/models/token.model'

@Injectable()
export class BookLifeService {
    constructor(
        @InjectModel(Observation.name)
        private readonly observationModel: Model<Observation>,
        private readonly usersService: UsersService,
        private readonly semestersService: SemestersService,
    ) {}

    async getObservationById(idObservation: string) {
        return await this.observationModel.findById(idObservation)
    }

    async getBooklife(idSemester: string, idUser: string) {
        return await this.observationModel
            .find(
                {
                    semester: idSemester,
                    student: idUser,
                },
                { student: 0 },
            )
            .populate('author', { name: 1, first_lastname: 1, user_type: 1 })
            .sort({ date: -1 })
            .exec()
    }

    async uploadObservation(
        observation: ObservationDTO,
        idStudent: string,
        idSemester: string,
        idAuthor: string,
    ) {
        const user = await this.usersService.getUserID(idStudent)
        if (!user) throw new BadRequestException('No existe el alumno')
        if (
            user.user_type !== Role.STUDENT &&
            user.user_type !== Role.STUDENT_DIRECTIVE
        )
            throw new BadRequestException('El usuario no es un alumno')
        if (user.status === 0)
            throw new BadRequestException('El alumno no está activo')
        const semester = await this.semestersService.getSemesterByID(idSemester)
        if (!semester) throw new BadRequestException('No existe el semestre')
        const currentSemester = await this.semestersService.getCurrentSemester()
        if (
            currentSemester.year < semester.year ||
            (currentSemester.year === semester.year &&
                currentSemester.semester < semester.semester)
        )
            throw new BadRequestException(
                'No se puede registrar una observación para un semestre más adelante que el vigente',
            )

        const newObservation = new this.observationModel({
            student: idStudent,
            semester: idSemester,
            author: idAuthor,
            type: observation.type,
            observation: observation.observation,
            date: new Date(),
        })
        const savedObservation = await newObservation.save()
        return await savedObservation.populate('author').then((data) => {
            const { _id, semester, author, type, observation, date } = data
            const authorData = author as User & { _id: string }
            return {
                _id,
                semester,
                type,
                observation,
                date,
                author: {
                    name: authorData.name,
                    first_lastname: authorData.first_lastname,
                    _id: authorData._id,
                    user_type: authorData.user_type,
                },
            }
        })
    }

    async updateObservation(
        observation: UpdateObservationDTO,
        idObservation: string,
        idUser: string,
    ) {
        const observationData = await this.getObservationById(idObservation)
        if (!observationData)
            throw new NotFoundException('No existe la observación')
        if (observationData.author.toString() !== idUser)
            throw new UnauthorizedException(
                'No puedes editar una observación no creada por ti',
            )
        return await this.observationModel
            .findByIdAndUpdate(
                idObservation,
                {
                    $set: observation,
                },
                { new: true },
            )
            .exec()
    }

    async deleteObservation(idObservation: string, user: PayloadToken) {
        const observation = await this.getObservationById(idObservation)
        if (!observation)
            throw new NotFoundException('No existe la observación')
        if (
            user.user_type === Role.TEACHER &&
            user._id !== observation.author.toString()
        )
            throw new UnauthorizedException(
                'No puedes eliminar una observación no hecha por ti',
            )
        return await this.observationModel.findByIdAndDelete(idObservation)
    }
}
