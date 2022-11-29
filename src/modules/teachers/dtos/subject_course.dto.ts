import { ApiProperty } from '@nestjs/swagger'
import { IsMongoId, IsNotEmpty } from 'class-validator'

export class SubjectCourseDTO {
    @ApiProperty({
        example: '638660ca141aa4ee9faf07e8',
    })
    @IsMongoId()
    @IsNotEmpty()
    course: string

    @ApiProperty({
        example: '638660ca141aa4ee9faf07e8',
    })
    @IsMongoId()
    @IsNotEmpty()
    subject: string
}
