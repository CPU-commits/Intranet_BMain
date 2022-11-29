import { ApiProperty } from '@nestjs/swagger'
import { Subject } from '../entities/subject.entity'

export class SubjectsRes {
    @ApiProperty({ type: [Subject] })
    subjects: Array<Subject>
}
