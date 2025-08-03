import { PartialType } from '@nestjs/swagger';
import { CreateImgOfDebtorDto } from './create-img-of-debtor.dto';

export class UpdateImgOfDebtorDto extends PartialType(CreateImgOfDebtorDto) {}
