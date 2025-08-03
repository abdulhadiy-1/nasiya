import { PartialType } from '@nestjs/swagger';
import { CreatePhoneOfDebtorDto } from './create-phone-of-debtor.dto';

export class UpdatePhoneOfDebtorDto extends PartialType(CreatePhoneOfDebtorDto) {}
