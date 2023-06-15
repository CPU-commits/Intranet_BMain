import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
    IsOptional,
    IsMongoId,
    IsNotEmpty,
    IsString,
    IsEnum,
    IsDateString,
} from 'class-validator'
import { AddressDTO } from 'src/modules/college/dtos/college.dto'

import { UpdateUserDTO, UserDTO } from 'src/modules/users/dtos/user.dto'

export class StudentDTO extends UserDTO {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    registration_number: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsMongoId()
    @IsNotEmpty()
    course?: string

    @ApiProperty()
    @IsEnum(['h', 'm'])
    @IsNotEmpty()
    gender: string

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    birthday: string

    @ApiProperty()
    @Type(() => AddressDTO)
    @IsNotEmpty()
    address: AddressDTO
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

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEnum(['h', 'm'])
    @IsNotEmpty()
    gender?: string

    @ApiProperty()
    @IsOptional()
    @IsDateString()
    @IsNotEmpty()
    birthday?: string

    @ApiProperty()
    @IsOptional()
    @Type(() => AddressDTO)
    @IsNotEmpty()
    address: AddressDTO
}
