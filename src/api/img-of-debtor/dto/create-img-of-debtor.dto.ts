import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsNotEmpty, IsString, IsUUID } from "class-validator"

export class CreateImgOfDebtorDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsArray()
    @IsString({each: true})
    paths: Array<string>
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    debtorId: string
}
