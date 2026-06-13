import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { ok } from '../../common/response';
import { RidersService } from './riders.service';

class CreateRiderDto {
  @ApiProperty()
  @IsString()
  tenantId!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  phone!: string;
}

@ApiTags('骑手（SAAS）')
@Controller('riders')
export class RidersController {
  constructor(private readonly riders: RidersService) {}

  @Get()
  @ApiQuery({ name: 'tenantId', required: true })
  list(@Query('tenantId') tenantId: string) {
    return ok(this.riders.list(tenantId));
  }

  @Post()
  create(@Body() dto: CreateRiderDto) {
    return ok(this.riders.create(dto));
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return ok(this.riders.get(id));
  }
}
