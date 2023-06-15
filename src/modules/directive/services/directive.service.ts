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
                name: 1,
            },
            search,
            limit,
            skip,
            total,
        )
    }

    async createDirective(directive: UserDTO, user_id: string) {
        const newDirective = await this.usersService.createUser({
            ...directive,
            user_type: Role.DIRECTIVE,
        })
        this.historyService.insertChange({
            change: `Se añade directivo con RUT ${directive.rut}`,
            collection_name: Collections.USER,
            who: user_id,
            type_change: 'add',
        })
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
        this.historyService.insertChange({
            change: `Se añaden directivos con RUTs: ${directives
                .map((directive) => directive.rut)
                .join(', ')}`,
            collection_name: Collections.USER,
            who: user_id,
            type_change: 'add',
        })
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
        this.historyService.insertChange({
            change: `Se actualiza directivo con RUT ${directive.rut}`,
            collection_name: Collections.USER,
            who: user_id,
            type_change: 'update',
        })
        return updatedDirective
    }

    async dismissDirective(directive_id: string, why: string, user_id: string) {
        const directive = await this.usersService.getUserID(directive_id)
        if (!directive) throw new NotFoundException('No existe el directivo')
        const status = directive.status === 0 ? 1 : 0
        const dismiss = await this.usersService.changeStatusUser(
            directive_id,
            status,
        )
        if (!status) {
            this.historyService.insertChange({
                change: `Se da de baja al directivo con RUT ${directive.rut}`,
                collection_name: Collections.USER,
                who: user_id,
                type_change: 'dismiss',
                why,
                affected: directive._id,
            })
        } else {
            this.historyService.insertChange({
                change: `Se reintegra al directivo con RUT ${directive.rut}`,
                collection_name: Collections.USER,
                who: user_id,
                type_change: 'reintegrate',
                why,
                affected: directive._id,
            })
        }
        return dismiss
    }
}
