import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsMongoId, IsNotEmpty, IsString } from 'class-validator'

import { UpdateUserDTO, UserDTO } from 'src/modules/users/dtos/user.dto'

export class StudentDTO extends UserDTO {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    registration_number: string
}

export class UpdateStudentDTO extends UpdateUserDTO {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsMongoId()
    @IsNotEmpty()
    course?: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    registration_number?: string
}
