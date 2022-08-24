export const VotingKey = 'voting'
export enum VotingValues {
    'opened',
    'uploaded',
    'in progress',
    'closed',
}
export enum VotingEnumValues {
    OPENED = 'opened',
    UPLOADED = 'uploaded',
    PROGRESS = 'in progress',
    CLOSED = 'closed',
}

export class Voting {
    key: typeof VotingKey
    value: keyof typeof VotingValues
}
