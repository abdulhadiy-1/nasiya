import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreatePhoneOfDebtorDto } from './create-phone-of-debtor.dto';
import { IsOptional } from 'class-validator';

export class UpdatePhoneOfDebtorDto {
  @ApiProperty()
  @IsOptional()
  debtorId?: string;
  @ApiProperty()
  @IsOptional()
  phoneNumber?: string;
}
