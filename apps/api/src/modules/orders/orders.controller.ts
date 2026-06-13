import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { GarbageType, OrderStatus } from '@garbage/shared';
import { ok } from '../../common/response';
import { AuthGuard } from '../auth/auth.guard';
import type { TokenPayload } from '../auth/auth.service';
import { OrdersService } from './orders.service';

class CreateOrderDto {
  @ApiProperty()
  @IsString()
  communityId!: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  addressId?: string;

  @ApiProperty({ enum: Object.values(GarbageType) })
  @IsIn(Object.values(GarbageType))
  garbageType!: GarbageType;

  @ApiProperty()
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  usePackage?: boolean;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  building?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  room?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  contactName?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  scheduledAt?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  remark?: string;
}

class AssignOrderDto {
  @ApiProperty()
  @IsString()
  riderId!: string;
}

class UpdateOrderStatusDto {
  @ApiProperty({ enum: Object.values(OrderStatus) })
  @IsIn(Object.values(OrderStatus))
  status!: OrderStatus;
}

class ReviewOrderDto {
  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty()
  @IsString()
  content!: string;
}

@ApiTags('订单')
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'userId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: OrderStatus })
  @ApiQuery({ name: 'tab', required: false, enum: ['all', 'ongoing', 'done'] })
  @ApiQuery({ name: 'page', required: false })
  list(
    @Query('tenantId') tenantId?: string,
    @Query('userId') userId?: string,
    @Query('status') status?: OrderStatus,
    @Query('tab') tab?: 'all' | 'ongoing' | 'done',
    @Query('page') page?: number,
  ) {
    return ok(this.orders.list({
      tenantId,
      userId,
      status,
      tab,
      page: Number(page) || 1,
    }));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return ok(this.orders.get(id));
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  create(@Req() req: { user: TokenPayload }, @Body() dto: CreateOrderDto) {
    const order = this.orders.create({
      userId: req.user.sub,
      communityId: dto.communityId,
      addressId: dto.addressId,
      garbageType: dto.garbageType,
      quantity: dto.quantity,
      usePackage: dto.usePackage,
      scheduledAt: dto.scheduledAt,
      remark: dto.remark,
      address: dto.building ? {
        communityId: dto.communityId,
        building: dto.building,
        unit: dto.unit || '-',
        room: dto.room || '',
        contactName: dto.contactName || '',
        contactPhone: dto.contactPhone || '',
      } : undefined,
    });
    return ok(order);
  }

  @Post(':id/pay')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  pay(@Param('id') id: string) {
    return ok(this.orders.pay(id));
  }

  @Post(':id/assign')
  assign(@Param('id') id: string, @Body() dto: AssignOrderDto) {
    return ok(this.orders.assign(id, dto.riderId));
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return ok(this.orders.updateStatus(id, dto.status));
  }

  @Post(':id/review')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  review(
    @Req() req: { user: TokenPayload },
    @Param('id') id: string,
    @Body() dto: ReviewOrderDto,
  ) {
    return ok(this.orders.review(id, req.user.sub, dto.rating, dto.content));
  }
}
