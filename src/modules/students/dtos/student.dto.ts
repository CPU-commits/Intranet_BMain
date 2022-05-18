import { IsOptional, IsMongoId, IsNotEmpty, IsString } from 'class-validator'

import { UpdateUserDTO, UserDTO } from 'src/modules/users/dtos/user.dto'

export class StudentDTO extends UserDTO {
    @IsString()
    @IsNotEmpty()
    registration_number: string
}

export class UpdateStudentDTO extends UpdateUserDTO {
    @IsOptional()
    @IsMongoId()
    @IsNotEmpty()
    course?: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    registration_number?: string
}
