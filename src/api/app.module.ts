import { Module } from '@nestjs/common';
import { PrismaModule } from '../common/prisma/prisma.module';
import { AdminModule } from './admin/admin.module';
import { MailModule } from 'src/common/mailer/mailer.module';
import { JwtModule } from '@nestjs/jwt';
import { config } from 'src/config';
import { SellerModule } from './seller/seller.module';
import { SampleModule } from './sample/sample.module';
import { DebtorModule } from './debtor/debtor.module';
import { NotificationModule } from './notification/notification.module';
import { DebtModule } from './debt/debt.module';
import { ScheduleModule } from '@nestjs/schedule';
import { PaymentReminderModule } from '../infrastructure/payment-reminder/payment-reminder.module';
import { ImgOfDebtModule } from './img-of-debt/img-of-debt.module';
import { ImgOfDebtorModule } from './img-of-debtor/img-of-debtor.module';
import { PhoneOfDebtorModule } from './phone-of-debtor/phone-of-debtor.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UploadModule } from 'src/infrastructure/upload/upload.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    NotificationModule,
    DebtModule,
    PaymentReminderModule,
    ImgOfDebtModule,
    ImgOfDebtorModule,
    PhoneOfDebtorModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', '..', '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    UploadModule,
  ],
})
export class AppModule {}
