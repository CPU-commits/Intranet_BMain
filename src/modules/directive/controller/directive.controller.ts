import {
    Body,
    Controller,
    Get,
    Param,
    ParseBoolPipe,
    Post,
    Put,
    Query,
    Req,
    Res,
    UseGuards,
} from '@nestjs/common'
import {
    ApiBody,
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    ApiServiceUnavailableResponse,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger'
import { Request, Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { PayloadToken } from 'src/auth/models/token.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import { ResApi } from 'src/models/res.model'
import { UpdateUserDTO, UserDTO } from 'src/modules/users/dtos/user.dto'
import { User } from 'src/modules/users/entities/user.entity'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { WhyDTO } from '../dtos/Directive.dto'
import { DirectiveRes } from '../res/directive.res'
import { DirectiveService } from '../services/directive.service'

@ApiTags('Main', 'Directive', 'roles.director')
@ApiServiceUnavailableResponse({
    description: 'MongoDB || Nats service unavailable',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/directive')
export class DirectiveController {
    constructor(private directiveService: DirectiveService) {}

    @ApiOperation({
        description: 'Get directives',
        summary: 'Get directives',
    })
    @ApiQuery({
        name: 'skip',
        required: false,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
    })
    @ApiQuery({
        name: 'search',
        required: false,
    })
    @ApiQuery({
        name: 'total',
        required: false,
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            type: 'array',
                            items: {
                                $ref: getSchemaPath(User),
                            },
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTOR)
    @Get('/get_directives')
    async getDirectives(
        @Res() res: Response,
        @Query('skip') skip?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('total', ParseBoolPipe) getTotal?: boolean,
    ) {
        try {
            const directives = await this.directiveService.getDirectives(
                search,
                skip,
                limit,
                getTotal,
            )
            handleRes(res, directives)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(DirectiveRes)
    @ApiOperation({
        summary: 'New directive',
        description: 'New directive',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(DirectiveRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTOR)
    @Post('/new_directive')
    async newDirective(
        @Res() res: Response,
        @Req() req: Request,
        @Body() directive: UserDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            const directiveData = await this.directiveService.createDirective(
                directive,
                user._id,
            )
            handleRes(res, {
                directive: directiveData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        summary: 'New directives',
        description: 'New directives',
    })
    @ApiBody({
        type: [UserDTO],
    })
    @ApiOkResponse({
        schema: {
            $ref: getSchemaPath(ResApi),
        },
    })
    @Roles(Role.DIRECTOR)
    @Post('/new_directives')
    async newDirectives(
        @Res() res: Response,
        @Req() req: Request,
        @Body() directives: UserDTO[],
    ) {
        try {
            const user = req.user as PayloadToken
            await this.directiveService.createDirectives(directives, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        summary: 'Change status directive',
        description: 'Change status directive. 0 -> 1 || 1 -> 0',
    })
    @ApiOkResponse({
        schema: {
            $ref: getSchemaPath(ResApi),
        },
    })
    @Roles(Role.DIRECTOR)
    @Post('/change_status/:idDirective')
    async changeStatus(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idDirective', MongoIdPipe) idDirective: string,
        @Body() why: WhyDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.directiveService.dismissDirective(
                idDirective,
                why.why,
                user._id,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        summary: 'Edit directive',
        description: 'Edit directive',
    })
    @ApiOkResponse({
        schema: {
            $ref: getSchemaPath(ResApi),
        },
    })
    @Roles(Role.DIRECTOR)
    @Put('/edit_directive/:idDirective')
    async editDirective(
        @Res() res: Response,
        @Req() req: Request,
        @Body() directive: UpdateUserDTO,
        @Param('idDirective', MongoIdPipe) idDirective: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.directiveService.updateDirective(
                directive,
                idDirective,
                user._id,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
