import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class UpdateImgOfDebtorDto {
  @ApiProperty()
  @IsOptional()
  debtorId?: string;
  @ApiProperty()
  @IsOptional()
  name?: string;
}
