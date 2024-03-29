export const NotifyGlobalChannel = 'notify/global'
export enum Type {
    'global',
    'student',
}

export type NotifyGlobal = {
    Title: string
    Link: string
    Img?: string
    Type: keyof typeof Type
}
