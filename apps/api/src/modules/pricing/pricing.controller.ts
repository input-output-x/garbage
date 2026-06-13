import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { ok } from '../../common/response';
import { PricingService } from './pricing.service';

@ApiTags('定价')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricing: PricingService) {}

  @Get()
  @ApiQuery({ name: 'tenantId', required: true })
  @ApiQuery({ name: 'communityId', required: false })
  list(
    @Query('tenantId') tenantId: string,
    @Query('communityId') communityId?: string,
  ) {
    return ok(this.pricing.list(tenantId, communityId));
  }
}
