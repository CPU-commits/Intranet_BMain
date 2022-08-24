import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { CollegeDTO } from '../dtos/college.dto'
import { CollegeService } from '../service/college.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/college')
export class CollegeController {
    constructor(private readonly collegeService: CollegeService) {}

    @Get('/get_college_data')
    async getCollegeData(@Res() res: Response) {
        try {
            const college = await this.collegeService.getCollegeData()
            handleRes(res, {
                college,
            })
        } catch (err) {
            handleError(err, res)
        }
    }

    @Roles(Role.DIRECTOR)
    @Post('/update_college')
    async updateCollege(@Res() res: Response, @Body() college: CollegeDTO) {
        try {
            await this.collegeService.updateCollegeData(college)
            handleRes(res)
        } catch (err) {
            handleError(err, res)
        }
    }
}
