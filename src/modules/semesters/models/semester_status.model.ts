export const CurrentSemesterStatusKey = 'current_semester_status'
export enum SemesterStatus {
    'working',
    'ending',
}

export type CurrentSemesterStatus = {
    key: string
    value: keyof typeof SemesterStatus
}
