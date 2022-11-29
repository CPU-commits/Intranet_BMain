import {
    Body,
    Controller,
    Get,
    Param,
    Post,
    Put,
    Req,
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
import { Request, Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { PayloadToken } from 'src/auth/models/token.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import { ResApi } from 'src/models/res.model'
import { WhyDTO } from 'src/modules/directive/dtos/Directive.dto'
import { UpdateUserDTO, UserDTO } from 'src/modules/users/dtos/user.dto'
import { User } from 'src/modules/users/entities/user.entity'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { LibrarianRes } from '../res/librarian.res'
import { LibraryService } from '../service/library.service'

@ApiTags('Main', 'Library', 'roles.director', 'roles.directive')
@ApiServiceUnavailableResponse({
    description: 'MongoDB || Nats service unavailable',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/library')
export class LibraryController {
    constructor(private readonly libraryService: LibraryService) {}

    @ApiOperation({
        summary: 'Get librarians',
        description: 'Get librarians',
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
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Get('/get_librarians')
    async getLibrarians(@Res() res: Response) {
        try {
            const librarians = await this.libraryService.getLibrarians()
            handleRes(res, {
                librarians,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiExtraModels(LibrarianRes)
    @ApiOperation({
        summary: 'New librarian',
        description: 'New librarian',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(LibrarianRes),
                        },
                    },
                },
            ],
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/new_librarian')
    async newLibrarian(
        @Res() res: Response,
        @Req() req: Request,
        @Body() librarian: UserDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            const librarianData = await this.libraryService.newLibrarian(
                librarian,
                user._id,
            )
            handleRes(res, {
                librarian: librarianData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        summary: 'Edit librarian',
        description: 'Edit librarian',
    })
    @ApiOkResponse({
        schema: {
            $ref: getSchemaPath(ResApi),
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Put('/edit_librarian/:idLibrarian')
    async editLibrarian(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idLibrarian', MongoIdPipe) idLibrarian: string,
        @Body() librarian: UpdateUserDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            const librarianData = await this.libraryService.updateLibrarian(
                librarian,
                idLibrarian,
                user._id,
            )
            handleRes(res, {
                librarian: librarianData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @ApiOperation({
        summary: 'Change status librarian',
        description: 'Change status librarian. 0 -> 1 || 1 -> 0',
    })
    @ApiOkResponse({
        schema: {
            $ref: getSchemaPath(ResApi),
        },
    })
    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/change_status/:idLibrarian')
    async changeStatus(
        @Res() res: Response,
        @Req() req: Request,
        @Param('idLibrarian', MongoIdPipe) idLibrarian: string,
        @Body() why: WhyDTO,
    ) {
        try {
            const user = req.user as PayloadToken
            await this.libraryService.dismissLibrarian(
                idLibrarian,
                why.why,
                user._id,
            )
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
