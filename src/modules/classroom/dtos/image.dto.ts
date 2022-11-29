import { ApiProperty } from '@nestjs/swagger'

export class FileDTO {
    @ApiProperty({ type: 'string', format: 'binary' })
    file: any
}
