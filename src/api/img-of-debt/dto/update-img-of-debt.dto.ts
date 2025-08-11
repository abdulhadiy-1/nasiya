import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class UpdateImgOfDebtDto {
  @ApiProperty()
  @IsOptional()
  debtId?: string;
  @ApiProperty()
  @IsOptional()
  name?: string;
}
