import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { MailModule } from 'src/common/mailer/mailer.module';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config';
import { SellerModule } from './seller/seller.module';
import { SampleModule } from './sample/sample.module';
import { DebtorModule } from './debtor/debtor.module';

@Module({
  imports: [
    PrismaModule,
    AdminModule,
    MailModule,
    JwtModule.register({
      global: true,
      secret: config.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    SellerModule,
    SampleModule,
    DebtorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
