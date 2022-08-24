import { IsInt, IsNotEmpty, Min } from 'class-validator'

export class GradeConfigDTO {
    @IsInt()
    @Min(0)
    @IsNotEmpty()
    min: number

    @IsInt()
    @Min(0)
    @IsNotEmpty()
    max: number
}
