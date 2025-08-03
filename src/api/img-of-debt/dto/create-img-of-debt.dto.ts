import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsUUID } from "class-validator"

export class CreateImgOfDebtDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    debtId: string
}
