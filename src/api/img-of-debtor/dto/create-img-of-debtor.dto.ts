import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsUUID } from "class-validator"

export class CreateImgOfDebtorDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    debtorId: string
}
