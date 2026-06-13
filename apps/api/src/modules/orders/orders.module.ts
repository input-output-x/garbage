import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AddressesModule } from '../addresses/addresses.module';
import { CommunitiesModule } from '../communities/communities.module';
import { PackagesModule } from '../packages/packages.module';
import { PricingModule } from '../pricing/pricing.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    AuthModule,
    CommunitiesModule,
    PricingModule,
    PackagesModule,
    AddressesModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
