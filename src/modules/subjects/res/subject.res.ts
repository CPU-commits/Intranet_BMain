import { ApiProperty } from '@nestjs/swagger'
import { Subject } from '../entities/subject.entity'

export class SubjectRes {
    @ApiProperty({ type: Subject })
    subject: Subject
}
