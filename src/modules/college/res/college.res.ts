import { ApiProperty } from '@nestjs/swagger'

class CollegeData {
    @ApiProperty({
        example: '4th Street',
    })
    direction: string

    @ApiProperty({
        example: 'mail@mail.com',
    })
    email: string

    @ApiProperty({
        example: '912343251',
    })
    phone: string
}

export class CollegeRes {
    @ApiProperty()
    college: CollegeData
}
