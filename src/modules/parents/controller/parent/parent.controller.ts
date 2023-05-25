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
import { Request, Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { ParentService } from '../../services/parent/parent.service'
import {
    ApiBody,
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiQuery,
    getSchemaPath,
} from '@nestjs/swagger'
import { ResApi } from 'src/models/res.model'
import { Parent } from '../../entities/parent.entity'
import { ParentRes } from '../../res/parent.res'
import { UpdateUserDTO, UserDTO } from 'src/modules/users/dtos/user.dto'
import { PayloadToken } from 'src/auth/models/token.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import { WhyDTO } from 'src/modules/directive/dtos/Directive.dto'
import { StudentParentDTO } from '../../dtos/parent.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/parents')
export class ParentController {
    constructor(private readonly parentService: ParentService) {}

    @ApiOperation({
        description: 'Get parents',
        summary: 'Get parents',
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
                                $ref: getSchemaPath(Parent),
                            },
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/')
    async getParents(
        @Res() res: Response,
        @Query('skip') skip?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
        @Query('total', ParseBoolPipe) getTotal?: boolean,
    ) {
        try {
            const parents = await this.parentService.getParents(
                search,
                skip,
                limit,
                getTotal,
            )
            handleRes(res, { parents: parents.users, total: parents.total })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/:idParent/students')
    async getParentStudentsByID(
        @Res() res: Response,
        @Param('idParent', MongoIdPipe) idParent: string,
    ) {
        try {
            const students = await this.parentService.getParentStudents(
                idParent,
            )
            handleRes(res, { students })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.ATTORNEY)
    @Get('/students')
    async getParentStudents(@Res() res: Response, @Req() req: Request) {
        try {
            const user = req.user as PayloadToken
            const students = await this.parentService.getParentStudents(
                user._id,
            )
            handleRes(res, { students })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(ParentRes)
    @ApiOperation({
        summary: 'New parent',
        description: 'New parent',
    })
    @ApiBody({
        type: [UserDTO],
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(ParentRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Post('/')
    async newParents(
        @Res() res: Response,
        @Req() req: Request,
        @Body() parents: Array<UserDTO>,
    ) {
        try {
            const user = req.user as PayloadToken
            const parentsData = await this.parentService.createParents(
                parents,
                user._id,
            )
            handleRes(res, {
                parents: parentsData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        summary: 'Change status parent',
        description: 'Change status parent. 0 -> 1 || 1 -> 0',
    })
    @ApiOkResponse({
        schema: {
            $ref: getSchemaPath(ResApi),
        },
    })
    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Post('/status/:idParent')
    async changeStatus(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idParent', MongoIdPipe) idParent: string,
        @Body() why: WhyDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.parentService.dismissParent(idParent, why.why, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }

    @Put('/:idParent/students')
    async assignStudent(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idParent', MongoIdPipe) idParent: string,
        @Body() studentParent: StudentParentDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            const student = await this.parentService.assignStudent(
                idParent,
                studentParent.idStudent,
                user._id,
            )
            handleRes(res, { student })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        summary: 'Edit parent',
        description: 'Edit parent',
    })
    @ApiOkResponse({
        schema: {
            $ref: getSchemaPath(ResApi),
        },
    })
    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Put('/:idParent')
    async editDirective(
        @Res() res: Response,
        @Req() req: Request,
        @Body() parent: UpdateUserDTO,
        @Param('idParent', MongoIdPipe) idParent: string,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.parentService.updateParent(parent, idParent, user._id)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
