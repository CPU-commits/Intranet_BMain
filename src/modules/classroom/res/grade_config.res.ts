import { ApiProperty } from '@nestjs/swagger'

export class GradeConfig {
    @ApiProperty()
    min: number

    @ApiProperty()
    max: number
}
