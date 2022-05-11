import { IsMongoId, IsNotEmpty } from 'class-validator'

export class SubjectCourseDTO {
    @IsMongoId()
    @IsNotEmpty()
    course: string

    @IsMongoId()
    @IsNotEmpty()
    subject: string
}
