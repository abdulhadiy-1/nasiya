import { Module } from '@nestjs/common';
import { ImgOfDebtorService } from './img-of-debtor.service';
import { ImgOfDebtorController } from './img-of-debtor.controller';

@Module({
  controllers: [ImgOfDebtorController],
  providers: [ImgOfDebtorService],
})
export class ImgOfDebtorModule {}
