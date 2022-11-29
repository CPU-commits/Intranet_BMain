import { ApiProperty } from '@nestjs/swagger'
import { Voting } from '../entities/voting.entity'

export class VotingRes {
    @ApiProperty({ type: Voting })
    voting: Voting
}
