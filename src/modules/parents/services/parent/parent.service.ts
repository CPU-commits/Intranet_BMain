import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Role } from 'src/auth/models/roles.model'
import { HistoryService } from 'src/modules/history/service/history.service'
import { UsersService } from 'src/modules/users/services/users/users.service'
import { Parent } from '../../entities/parent.entity'
import { Model } from 'mongoose'
import { UpdateUserDTO, UserDTO } from 'src/modules/users/dtos/user.dto'
import { ObjectId } from 'mongodb'
import { Collections } from 'src/modules/history/models/collections.model'
import { User } from 'src/modules/users/entities/user.entity'

@Injectable()
export class ParentService {
    constructor(
        @InjectModel(Parent.name) private readonly parentModel: Model<Parent>,
        private readonly usersService: UsersService,
        private readonly historyService: HistoryService,
    ) {}

    async getParents(
        search?: string,
        skip?: number,
        limit?: number,
        total = false,
    ) {
        const users = await this.usersService.getUsers(
            {
                user_type: Role.ATTORNEY,
            },
            {
                password: 0,
            },
            {
                status: -1,
                name: 1,
            },
            search,
            limit,
            skip,
            total,
        )
        return users
    }

    async getParentStudents(idParent: string) {
        const parent = await this.parentModel
            .findOne({
                user: new ObjectId(idParent),
            })
            .populate<{ students: Array<User & { _id: ObjectId }> }>(
                'students',
                {
                    name: 1,
                    first_lastname: 1,
                    rut: 1,
                },
            )
            .exec()
        if (!parent) throw new NotFoundException('No existe el apoderado')
        return parent.students
    }

    async createParents(parents: UserDTO[], user_id: string) {
        const newParents = await this.usersService.createUsers(
            parents.map((parent) => {
                return {
                    ...parent,
                    user_type: Role.ATTORNEY,
                }
            }),
        )
        await this.parentModel.insertMany(
            newParents.map((parent) => ({
                user: new ObjectId(parent._id.toString()),
            })),
        )
        this.historyService.insertChange({
            change: `Se añaden apoderados con RUTs: ${parents
                .map((directive) => directive.rut)
                .join(', ')}`,
            collection_name: Collections.USER,
            who: user_id,
            type_change: 'add',
        })
        if (parents.length === 1) return newParents[0]
        return newParents
    }

    async updateParent(
        parent: UpdateUserDTO,
        idParent: string,
        idUser: string,
    ) {
        const updatedParent = await this.usersService.updateUser(
            parent,
            idParent,
        )
        this.historyService.insertChange({
            change: `Se actualiza pariente con RUT ${parent.rut}`,
            collection_name: Collections.USER,
            who: idUser,
            type_change: 'update',
        })
        return updatedParent
    }

    async assignStudent(idParent: string, idStudent: string, idUser: string) {
        const parent = await this.parentModel
            .findOne({
                user: new ObjectId(idParent),
            })
            .populate<{ user: { rut: string } }>('user', { rut: 1 })
        if (!parent) throw new NotFoundException('No existe el apoderado')
        const student = await this.usersService.getUserID(idStudent)
        if (!student) throw new NotFoundException('No existe el estudiante')
        if (
            student.user_type !== Role.STUDENT &&
            student.user_type !== Role.STUDENT_DIRECTIVE
        )
            throw new BadRequestException(
                'El usuario a asignar no es un estudiante',
            )
        if (
            parent.students
                .map((student) => student.toString())
                .includes(idStudent)
        )
            throw new ConflictException('Este alumno ya está asignado')
        // Assign
        await parent
            .updateOne(
                { $addToSet: { students: new ObjectId(idStudent) } },
                { new: true },
            )
            .exec()
        // History
        this.historyService.insertChange({
            change: `Se ha asignado el alumno con RUT ${student.rut} al apoderado con RUT ${parent.user.rut}`,
            collection_name: Collections.USER,
            who: idUser,
            type_change: 'update',
        })
        return {
            rut: student.rut,
            name: student.name,
            first_lastname: student.first_lastname,
        }
    }

    async dismissParent(idParent: string, why: string, idUser: string) {
        const parent = await this.usersService.getUserID(idParent)
        if (!parent) throw new NotFoundException('No existe el apoderado')
        const status = parent.status === 0 ? 1 : 0
        const dismiss = await this.usersService.changeStatusUser(
            idParent,
            status,
        )
        if (!status) {
            this.historyService.insertChange({
                change: `Se da de baja al apoderado con RUT ${parent.rut}`,
                collection_name: Collections.USER,
                who: idUser,
                type_change: 'dismiss',
                why,
                affected: parent._id,
            })
        } else {
            this.historyService.insertChange({
                change: `Se reintegra al apoderado con RUT ${parent.rut}`,
                collection_name: Collections.USER,
                who: idUser,
                type_change: 'reintegrate',
                why,
                affected: parent._id,
            })
        }
        return dismiss
    }
}
