import { IsMongoId, IsNotEmpty } from 'class-validator'

export class AnchorDTO {
    @IsMongoId()
    @IsNotEmpty()
    course: string

    @IsMongoId()
    @IsNotEmpty()
    subject: string
}