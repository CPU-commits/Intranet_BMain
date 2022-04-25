import { IsNotEmpty, IsString, MaxLength } from 'class-validator'

export class CycleDTO {
    @IsString()
    @MaxLength(100)
    @IsNotEmpty()
    cycle: string
}
