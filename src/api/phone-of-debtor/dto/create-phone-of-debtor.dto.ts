import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreatePhoneOfDebtorDto {
  @ApiProperty({ type: [String] })
  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  phoneNumber: string[];

  @ApiProperty()
  @IsNotEmpty()
  @IsUUID()
  debtorId: string;
}
