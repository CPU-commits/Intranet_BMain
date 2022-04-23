import { Injectable, NotFoundException } from '@nestjs/common'
import { Role } from 'src/auth/models/roles.model'
import { Collections } from 'src/modules/history/models/collections.model'
import { HistoryService } from 'src/modules/history/service/history.service'
import { UpdateUserDTO, UserDTO } from 'src/modules/users/dtos/user.dto'
import { UsersService } from 'src/modules/users/services/users/users.service'

@Injectable()
export class DirectiveService {
    constructor(
        private usersService: UsersService,
        private historyService: HistoryService,
    ) {}

    async getDirectives(
        search?: string,
        skip?: number,
        limit?: number,
        total = false,
    ) {
        return await this.usersService.getUsers(
            {
                user_type: Role.DIRECTIVE,
            },
            {
                password: 0,
            },
            {
                status: -1,
            },
            search,
            limit,
            skip,
            total,
        )
    }

    async createDirective(directive: UserDTO, user_id: string) {
        const newDirective = this.usersService.createUser({
            ...directive,
            user_type: Role.DIRECTIVE,
        })
        this.historyService.insertChange(
            `Se añade directivo con RUT ${directive.rut}`,
            Collections.USER,
            user_id,
            'add',
        )
        return newDirective
    }

    async createDirectives(directives: UserDTO[], user_id: string) {
        const newDirectives = this.usersService.createUsers(
            directives.map((directive) => {
                return {
                    ...directive,
                    user_type: Role.DIRECTIVE,
                }
            }),
        )
        this.historyService.insertChange(
            `Se añaden directivos con RUTs: ${directives
                .map((directive) => directive.rut)
                .join(', ')}`,
            Collections.USER,
            user_id,
            'add',
        )
        return newDirectives
    }

    async updateDirective(
        directive: UpdateUserDTO,
        directive_id: string,
        user_id: string,
    ) {
        const updatedDirective = await this.usersService.updateUser(
            directive,
            directive_id,
        )
        this.historyService.insertChange(
            `Se actualiza directivo con RUT ${directive.rut}`,
            Collections.USER,
            user_id,
            'update',
        )
        return updatedDirective
    }

    async dismissDirective(directive_id: string, user_id: string) {
        const directive = await this.usersService.getUserID(directive_id)
        if (!directive) throw new NotFoundException('No existe el directivo')
        const dismiss = await this.usersService.changeStatusUser(
            directive_id,
            0,
        )
        this.historyService.insertChange(
            `Se da de baja al directivo con RUT ${directive.rut}`,
            Collections.USER,
            user_id,
            'dismiss',
        )
        return dismiss
    }
}
