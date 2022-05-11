import { IsOptional, IsMongoId, IsNotEmpty } from 'class-validator'

import { UpdateUserDTO } from 'src/modules/users/dtos/user.dto'

export class UpdateStudentDTO extends UpdateUserDTO {
    @IsOptional()
    @IsMongoId()
    @IsNotEmpty()
    course?: string
}
