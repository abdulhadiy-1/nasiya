import { Module } from '@nestjs/common';
import { PhoneOfDebtorService } from './phone-of-debtor.service';
import { PhoneOfDebtorController } from './phone-of-debtor.controller';

@Module({
  controllers: [PhoneOfDebtorController],
  providers: [PhoneOfDebtorService],
})
export class PhoneOfDebtorModule {}
