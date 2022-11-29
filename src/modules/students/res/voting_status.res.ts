import { ApiProperty } from '@nestjs/swagger'

export class VotingStatusRes {
    @ApiProperty({
        enum: ['opened', 'uploaded', 'in progress', 'closed'],
        example: 'opened',
    })
    status: string
}
