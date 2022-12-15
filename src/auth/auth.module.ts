import { Module } from '@nestjs/common'
import { JwtModule, JwtSignOptions } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ConfigType } from '@nestjs/config'

import { UsersModule } from 'src/modules/users/users.module'
import { AuthController } from './controller/auth.controller'
import { AuthService } from './services/auth.service'
import config from 'src/config'
import { LocalStrategy } from './strategies/local.strategy'
import { JwtStrategy } from './strategies/jwt.strategy'
import { MongooseModule } from '@nestjs/mongoose'
import { Auth, AuthShema } from './entities/auth.model'

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            inject: [config.KEY],
            useFactory: (configService: ConfigType<typeof config>) => {
                const signOptions: JwtSignOptions = {
                    algorithm: 'HS256',
                }
                if (configService.node_env === 'prod')
                    signOptions.expiresIn = '2h'
                return {
                    secret: configService.jwtSecret,
                    signOptions,
                }
            },
        }),
        MongooseModule.forFeature([
            {
                name: Auth.name,
                schema: AuthShema,
            },
        ]),
    ],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
