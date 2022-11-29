import { ApiProperty } from '@nestjs/swagger'
import { Vote } from '../entities/vote.entity'

export class VoteRes {
    @ApiProperty({ type: Vote })
    vote: Vote
}
