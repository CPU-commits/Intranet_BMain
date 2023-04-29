import {
    Body,
    Controller,
    FileTypeValidator,
    ParseFilePipe,
    Post,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { ExcelService } from '../../services/excel/excel.service'
import { ExcelDTO } from '../../dtos/excel.dto'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/files')
export class FilesController {
    constructor(private readonly excelService: ExcelService) {}

    @Roles(Role.DIRECTOR, Role.DIRECTIVE)
    @Post('/excel')
    @UseInterceptors(FileInterceptor('file'))
    async readExcel(
        @Res() res: Response,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new FileTypeValidator({
                        fileType:
                            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    }),
                ],
            }),
        )
        file: Express.Multer.File,
        @Body() excel: ExcelDTO,
    ) {
        try {
            const excelData = await this.excelService.readFileExcel(file, excel)
            handleRes(res, {
                excelData,
            })
        } catch (err) {
            handleError(err, res)
        }
    }
}
