import { PartialType } from '@nestjs/swagger';
import { CreateImgOfDebtDto } from './create-img-of-debt.dto';

export class UpdateImgOfDebtDto extends PartialType(CreateImgOfDebtDto) {}
