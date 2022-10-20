export const VotingKey = 'voting'
export enum VotingValues {
    'opened', // Can open voting
    'uploaded', // Uploaded and wait to date
    'in progress', // In progress...
    'closed', // Closed, and wait for open
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
