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
import { Request, Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { PayloadToken } from 'src/auth/models/token.model'
import { MongoIdPipe } from 'src/common/mongo-id.pipe'
import { WhyDTO } from 'src/modules/directive/dtos/Directive.dto'
import { UpdateUserDTO, UserDTO } from 'src/modules/users/dtos/user.dto'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { LibraryService } from '../service/library.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/library')
export class LibraryController {
    constructor(private readonly libraryService: LibraryService) {}

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

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Put('/edit_librarian/:id')
    async editLibrarian(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idLibrarian: string,
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

    @Roles(Role.DIRECTIVE, Role.DIRECTOR)
    @Post('/change_status/:id')
    async changeStatus(
        @Res() res: Response,
        @Req() req: Request,
        @Param('id', MongoIdPipe) idLibrarian: string,
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
