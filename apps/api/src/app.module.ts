import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { OrdersModule } from './modules/orders/orders.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { CommunitiesModule } from './modules/communities/communities.module';
import { RidersModule } from './modules/riders/riders.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { PackagesModule } from './modules/packages/packages.module';
import { AddressesModule } from './modules/addresses/addresses.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { StoreModule } from './store/store.module';

@Module({
  imports: [
    StoreModule,
    AuthModule,
    TenantsModule,
    CommunitiesModule,
    RidersModule,
    PricingModule,
    PackagesModule,
    AddressesModule,
    ReviewsModule,
    OrdersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
