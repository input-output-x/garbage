import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ok } from '../../common/response';
import { AuthGuard } from '../auth/auth.guard';
import type { TokenPayload } from '../auth/auth.service';
import { PackagesService } from './packages.service';
import { DEMO_TENANT_ID } from '../../store/types';

class PurchaseDto {
  @ApiProperty()
  @IsString()
  planId!: string;
}

@ApiTags('套餐')
@Controller('packages')
export class PackagesController {
  constructor(private readonly packages: PackagesService) {}

  @Get('plans')
  @ApiQuery({ name: 'tenantId', required: false })
  listPlans(@Query('tenantId') tenantId?: string) {
    return ok(this.packages.listPlans(tenantId || DEMO_TENANT_ID));
  }

  @Get('my')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  myPackage(@Req() req: { user: TokenPayload }) {
    return ok(this.packages.getActivePackage(req.user.sub));
  }

  @Get('my/list')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  myList(@Req() req: { user: TokenPayload }) {
    return ok(this.packages.listUserPackages(req.user.sub));
  }

  @Post('purchase')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  purchase(@Req() req: { user: TokenPayload }, @Body() dto: PurchaseDto) {
    const pkg = this.packages.purchase(req.user.sub, dto.planId);
    return ok(pkg, '购买成功');
  }

  @Get('plans/:id')
  getPlan(@Param('id') id: string) {
    return ok(this.packages.getPlan(id));
  }
}
