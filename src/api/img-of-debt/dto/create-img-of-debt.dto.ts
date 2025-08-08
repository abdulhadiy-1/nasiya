import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator"

export class CreateImgOfDebtDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsArray()
    @IsString({each: true})
    paths: Array<string>
    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    debtId: string
}
