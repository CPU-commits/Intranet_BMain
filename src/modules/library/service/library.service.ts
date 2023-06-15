import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common'
import { Role } from 'src/auth/models/roles.model'
import { Collections } from 'src/modules/history/models/collections.model'
import { HistoryService } from 'src/modules/history/service/history.service'
import { UpdateUserDTO, UserDTO } from 'src/modules/users/dtos/user.dto'
import { UsersService } from 'src/modules/users/services/users/users.service'

@Injectable()
export class LibraryService {
    constructor(
        private readonly usersService: UsersService,
        private readonly historyService: HistoryService,
    ) {}

    async getLibrarians() {
        return await this.usersService.getUsers(
            {
                user_type: Role.LIBRARIAN,
            },
            {
                password: 0,
            },
            {
                status: -1,
                name: 1,
            },
        )
    }

    async newLibrarian(librarian: UserDTO, idUser: string) {
        const newLibrarian = await this.usersService.createUser({
            ...librarian,
            user_type: Role.LIBRARIAN,
        })
        this.historyService.insertChange({
            change: `Se añade bibliotecario con RUT ${librarian.rut}`,
            collection_name: Collections.USER,
            who: idUser,
            type_change: 'add',
        })
        return newLibrarian
    }

    async updateLibrarian(
        librarian: UpdateUserDTO,
        idLibrarian: string,
        idUser: string,
    ) {
        const user = await this.usersService.getUserID(idLibrarian)
        if (!user) throw new NotFoundException('No existe el usuario a editar')
        if (user.user_type !== Role.LIBRARIAN)
            throw new BadRequestException(
                'El usuario debe ser de tipo bibliotecario',
            )
        const updatedLibrarian = await this.usersService.updateUser(
            librarian,
            idLibrarian,
        )
        this.historyService.insertChange({
            change: `Se actualiza el bibliotecario con RUT ${librarian.rut}`,
            collection_name: Collections.USER,
            who: idUser,
            type_change: 'update',
        })
        return updatedLibrarian
    }

    async dismissLibrarian(idLibrarian: string, why: string, idUser: string) {
        const user = await this.usersService.getUserID(idLibrarian)
        if (!user) throw new NotFoundException('No existe el usuario a editar')
        if (user.user_type !== Role.LIBRARIAN)
            throw new BadRequestException(
                'El usuario debe ser de tipo bibliotecario',
            )
        const status = user.status === 0 ? 1 : 0
        const dismiss = await this.usersService.changeStatusUser(
            idLibrarian,
            status,
        )
        if (!status) {
            this.historyService.insertChange({
                change: `Se da de baja al bibliotecario con RUT ${user.rut}`,
                collection_name: Collections.USER,
                who: idUser,
                type_change: 'dismiss',
                why,
                affected: user._id,
            })
        } else {
            this.historyService.insertChange({
                change: `Se reintegra al bibliotecario con RUT ${user.rut}`,
                collection_name: Collections.USER,
                who: idUser,
                type_change: 'reintegrate',
                why,
                affected: user._id,
            })
        }
        return dismiss
    }
}
