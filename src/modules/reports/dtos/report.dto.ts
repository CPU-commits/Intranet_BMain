import {
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator'
import { ReportType, ReportTypeKeys } from '../models/report_type.model'
import { Type } from 'class-transformer'

export class ReportReportDTO {
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string

    @IsString()
    @IsEnum(ReportTypeKeys)
    type: keyof typeof ReportType
}

export class ReportErrorDTO {
    @IsString()
    @IsNotEmpty()
    message: string

    @IsInt()
    @IsNotEmpty()
    statusCode: number
}

export class ReportDTO {
    @ValidateNested()
    @Type(() => ReportReportDTO)
    @IsNotEmpty()
    report: ReportReportDTO

    @IsOptional()
    @ValidateNested()
    @Type(() => ReportErrorDTO)
    error: ReportErrorDTO
}
