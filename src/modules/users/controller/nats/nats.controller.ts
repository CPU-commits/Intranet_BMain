import { Controller, NotFoundException, UseInterceptors } from '@nestjs/common'
import { Payload } from '@nestjs/microservices'
import { MessagePattern } from '@nestjs/microservices'
import { LoggerInterceptor } from 'src/logger.interceptor'
import { NatsRes } from 'src/models/nats_rest.model'
import { UsersService } from '../../services/users/users.service'

@UseInterceptors(LoggerInterceptor)
@Controller('nats')
export class NatsController {
    constructor(private readonly usersService: UsersService) {}

    @MessagePattern('get_user_by_id')
    async getUser(@Payload() data: { idUser: string }): Promise<NatsRes> {
        const user = await this.usersService.getUserID(data.idUser)
        if (!user) throw new NotFoundException('No existe el usuario')
        // Format data
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...rest } = user
        return {
            success: true,
            data: {
                user: rest,
            },
        }
    }

    @MessagePattern('get_users_by_id')
    async getUsers(@Payload() data: Array<string>): Promise<NatsRes> {
        const users = await this.usersService.getUsers({
            _id: {
                $in: data.map((id) => new Object(id)),
            },
        })
        return {
            success: true,
            data: users.users,
        }
    }
}
