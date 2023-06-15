import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
    IsEmail,
    IsLatitude,
    IsLongitude,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator'

export class AddressDTO {
    @ApiProperty({
        example: 'Chile Providencia...',
    })
    @IsString()
    @IsNotEmpty()
    street_number_name: string

    @ApiProperty({
        example: '1064',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    building_site_number: string

    @ApiProperty({
        example: 'Santiago',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    city: string

    @ApiProperty({
        example: '04905 035',
    })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    postal_code: string

    @ApiProperty({
        example: 'Chile',
    })
    @IsString()
    @IsNotEmpty()
    country: string

    @ApiProperty({
        example: '-0.45',
    })
    @IsOptional()
    @IsLatitude()
    @IsNotEmpty()
    lat: number

    @ApiProperty({
        example: '-0.45',
    })
    @IsOptional()
    @IsLongitude()
    @IsNotEmpty()
    lng: number
}

export class CollegeDTO {
    @ApiProperty({
        maxLength: 100,
        example: '4Th Street',
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    direction: string

    @ApiProperty({
        maxLength: 100,
        example: '912345432',
    })
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    phone: string

    @ApiProperty({
        maxLength: 100,
        example: 'mail@mail.com',
    })
    @IsEmail()
    @MaxLength(100)
    @IsNotEmpty()
    email: string

    @ApiProperty()
    @Type(() => AddressDTO)
    @IsNotEmpty()
    address: AddressDTO
}
