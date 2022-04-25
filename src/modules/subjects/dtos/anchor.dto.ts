import { IsMongoId, IsNotEmpty } from 'class-validator'

export class AnchorDTO {
    @IsMongoId()
    @IsNotEmpty()
    section: string

    @IsMongoId()
    @IsNotEmpty()
    subject: string
}
