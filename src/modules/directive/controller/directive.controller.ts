import {
    Controller,
    Get,
    ParseBoolPipe,
    ParseIntPipe,
    Query,
    Res,
    UseGuards,
} from '@nestjs/common'
import { Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { DirectiveService } from '../services/directive.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/directive')
export class DirectiveController {
    constructor(private directiveService: DirectiveService) {}

    @Roles(Role.DIRECTOR)
    @Get('/get_directives')
    async getDirectives(
        @Res() res: Response,
        @Query('skip', ParseIntPipe) skip?: number,
        @Query('limit', ParseIntPipe) limit?: number,
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
            handleRes(directives, res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
