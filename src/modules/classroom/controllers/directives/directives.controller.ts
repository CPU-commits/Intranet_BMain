import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Res,
    UseGuards,
} from '@nestjs/common'
import {
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiServiceUnavailableResponse,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger'
import { Response } from 'express'
import { ObjectId } from 'mongodb'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import { ResApi } from 'src/models/res.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { DirectiveDTO } from '../../dtos/directive.dto'
import { DirectivesRes } from '../../res/directives.res'
import { DirectivesStatusRes } from '../../res/directives_status.res'
import { DirectivesService } from '../../service/directives.service'

@ApiTags(
    'Main',
    'Classroom',
    'Classroom - Directives',
    'roles.directive',
    'roles.director',
)
@ApiServiceUnavailableResponse({
    description: 'MongoDB || Nats service unavailable',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/classroom/directives')
export class DirectivesController {
    constructor(private readonly directiveService: DirectivesService) {}

    @ApiExtraModels(DirectivesRes)
    @ApiOperation({
        description: 'Get directive',
        summary: 'Get directive',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(DirectivesRes),
                        },
                    },
                },
            ],
        },
    })
    @ApiTags('roles.teacher')
    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.TEACHER)
    @Get('/get_directive/:idModule')
    async getDirective(
        @Res() res: Response,
        @Param('idModule', MongoIdPipe) idModule: string,
    ) {
        try {
            const directives = await this.directiveService.getDirectiveModule(
                new ObjectId(idModule),
            )
            handleRes(res, {
                directives,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(DirectivesStatusRes)
    @ApiOperation({
        description: 'Get directives status',
        summary: 'Get directives status',
    })
    @ApiTags('roles.teacher')
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(DirectivesStatusRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR, Role.TEACHER)
    @Get('/get_directives_status')
    async getDirectivesStatus(@Res() res: Response) {
        try {
            const directivesStatus =
                await this.directiveService.getDirectivesStatus()
            handleRes(res, {
                directives: directivesStatus,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        description: 'Add directive to module',
        summary: 'Add directive',
    })
    @ApiOkResponse({
        schema: {
            $ref: getSchemaPath(ResApi),
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/add_directive/:idModule')
    async addDirective(
        @Res() res: Response,
        @Body() directive: DirectiveDTO,
        @Param('idModule', MongoIdPipe) idModule: string,
    ) {
        try {
            await this.directiveService.addDirectiveModule(directive, idModule)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
