import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsUUID } from "class-validator"

export class CreatePhoneOfDebtorDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    phoneNumber: string
    @ApiProperty()
    @IsNotEmpty()
    @IsUUID()
    debtorId: string
}
