import { IsNotEmpty, IsString } from 'class-validator'

export class ContactDTO {
    @IsString()
    @IsNotEmpty()
    contact: string
}
