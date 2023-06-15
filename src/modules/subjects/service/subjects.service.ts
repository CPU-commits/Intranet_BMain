import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { CourseService } from 'src/modules/courses/service/course.service'
import { Collections } from 'src/modules/history/models/collections.model'
import { HistoryService } from 'src/modules/history/service/history.service'
import { AnchorDTO } from '../dtos/anchor.dto'
import { SubjectDTO } from '../dtos/subject.dto'

import { Specialty } from '../entities/specialty.entity'
import { Subject } from '../entities/subject.entity'

@Injectable()
export class SubjectsService {
    constructor(
        @InjectModel(Subject.name) private subjectModel: Model<Subject>,
        @InjectModel(Specialty.name) private specialtyModel: Model<Specialty>,
        private historyService: HistoryService,
        private courseService: CourseService,
    ) {}

    async getSubjectCustom(query = null, filter = null) {
        return await this.subjectModel
            .findOne({ status: true, ...query }, filter)
            .exec()
    }

    async getSubjects() {
        return await this.subjectModel
            .find({ status: true })
            .populate('specialty')
            .exec()
    }

    async getSpecialtyByID(idSpecialty: string) {
        return await this.specialtyModel.findById(idSpecialty).exec()
    }

    async getSpecialties() {
        return await this.specialtyModel.find().exec()
    }
    // Subjects
    async newSubject(subject: SubjectDTO, idUser: string) {
        const newSubject = new this.subjectModel(subject)
        await newSubject.save()
        this.historyService.insertChange({
            change: `Se ha agregado la materia ${subject.subject}`,
            collection_name: Collections.SUBJECT,
            who: idUser,
            type_change: 'add',
        })
        return newSubject
    }

    async deleteSubject(idSubject: string, idUser: string) {
        const subject = await this.getSubjectCustom({
            _id: idSubject,
        })
        if (!subject) throw new NotFoundException('No existe esta materia')
        const isUsed = await this.courseService.getSectionCustom({
            subjects: {
                $in: [idSubject],
            },
        })
        if (isUsed)
            throw new ConflictException('La materia está en uso en un anclaje')
        const deletedSubject = await this.subjectModel.findByIdAndUpdate(
            idSubject,
            {
                $set: {
                    status: false,
                },
            },
            {
                new: true,
            },
        )
        this.historyService.insertChange({
            change: `Se ha eliminado la materia ${subject.subject}`,
            collection_name: Collections.SUBJECT,
            who: idUser,
            type_change: 'delete',
        })
        return deletedSubject
    }
    // Specialties
    async newSpecialty(specialty: string, idUser: string) {
        const newSpecialty = new this.specialtyModel({
            specialty,
        })
        await newSpecialty.save()
        this.historyService.insertChange({
            change: `Se ha agregado la especialidad ${specialty}`,
            collection_name: Collections.SPECIALTY,
            who: idUser,
            type_change: 'add',
        })
        return newSpecialty
    }

    async deleteSpecialty(idSpecialty: string, idUser: string) {
        const specialty = await this.getSpecialtyByID(idSpecialty)
        if (!specialty)
            throw new NotFoundException('No existe esta especialidad')
        const subject = await this.getSubjectCustom({
            specialty: idSpecialty,
        })
        if (subject)
            throw new ConflictException('Esta especialidad está en uso')
        const deletedSpecialty = await this.specialtyModel.findByIdAndDelete(
            idSpecialty,
        )
        this.historyService.insertChange({
            change: `Se ha eliminado la especialidad ${specialty.specialty}`,
            collection_name: Collections.SPECIALTY,
            who: idUser,
            type_change: 'delete',
        })
        return deletedSpecialty
    }
    // Anchors
    async addSubject(anchor: AnchorDTO, userId: string) {
        const exists = await Promise.all([
            this.courseService.getCourseCustom({
                _id: anchor.course,
            }),
            this.getSubjectCustom({
                _id: anchor.subject,
            }),
        ]).then(async (data) => {
            return {
                subject: data[1],
                course: data[0],
            }
        })
        if (!exists.subject || !exists.course)
            throw new ConflictException('No existe el curso o la materia')
        await exists.course
            .updateOne(
                {
                    $push: {
                        subjects: anchor.subject,
                    },
                },
                { new: true },
            )
            .exec()
        this.historyService.insertChange({
            change: `Se ha añadido la materia ${exists.subject.subject} al curso ${exists.course.course}`,
            collection_name: Collections.COURSE,
            who: userId,
            type_change: 'add',
        })
        return exists.subject
    }

    async deleteSubjectCourse(
        idSubject: string,
        idCourse: string,
        idUser: string,
    ) {
        const exists = await Promise.all([
            this.courseService.getCourseCustom({
                _id: idCourse,
            }),
            this.getSubjectCustom({
                _id: idSubject,
            }),
        ]).then(async (data) => {
            return {
                subject: data[1],
                course: data[0],
            }
        })
        if (!exists.subject || !exists.course)
            throw new ConflictException('No existe el curso o la materia')
        await exists.course
            .updateOne(
                {
                    $pull: {
                        subjects: idSubject,
                    },
                },
                { new: true },
            )
            .exec()
        this.historyService.insertChange({
            change: `Se ha eliminado la materia ${exists.subject.subject} del curso ${exists.course.course}`,
            collection_name: Collections.COURSE,
            who: idUser,
            type_change: 'add',
        })
        return exists.subject
    }
}
