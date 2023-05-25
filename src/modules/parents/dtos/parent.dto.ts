import { IsMongoId, IsNotEmpty, IsString } from 'class-validator'

export class StudentParentDTO {
    @IsString()
    @IsMongoId()
    @IsNotEmpty()
    idStudent: string
}
