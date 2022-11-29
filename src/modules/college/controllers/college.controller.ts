import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common'
import {
    ApiExtraModels,
    ApiOkResponse,
    ApiOperation,
    ApiServiceUnavailableResponse,
    ApiTags,
    getSchemaPath,
} from '@nestjs/swagger'
import { Response } from 'express'
import { Roles } from 'src/auth/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard'
import { RolesGuard } from 'src/auth/guards/roles.guard'
import { Role } from 'src/auth/models/roles.model'
import { ResApi } from 'src/models/res.model'
import handleError from 'src/res/handleError'
import handleRes from 'src/res/handleRes'
import { CollegeDTO } from '../dtos/college.dto'
import { CollegeRes } from '../res/college.res'
import { CollegeService } from '../service/college.service'

@ApiTags('Main', 'College')
@ApiServiceUnavailableResponse({
    description: 'MongoDB || Nats service unavailable',
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('api/college')
export class CollegeController {
    constructor(private readonly collegeService: CollegeService) {}

    @ApiExtraModels(CollegeRes)
    @ApiOperation({
        description: 'Get college data',
        summary: 'Get college data',
    })
    @ApiOkResponse({
        schema: {
            allOf: [
                { $ref: getSchemaPath(ResApi) },
                {
                    properties: {
                        body: {
                            $ref: getSchemaPath(CollegeRes),
                        },
                    },
                },
            ],
        },
    })
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

    @ApiOperation({
        description: 'Update College',
        summary: 'Update College',
    })
    @ApiOkResponse({
        schema: {
            $ref: getSchemaPath(ResApi),
        },
    })
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
