import { Module } from '@nestjs/common';
import { ImgOfDebtService } from './img-of-debt.service';
import { ImgOfDebtController } from './img-of-debt.controller';

@Module({
  controllers: [ImgOfDebtController],
  providers: [ImgOfDebtService],
})
export class ImgOfDebtModule {}
