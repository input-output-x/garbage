import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { TenantStatus } from '@garbage/shared';
import { ok } from '../../common/response';
import { TenantsService } from './tenants.service';

class CreateTenantDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  contactPhone!: string;

  @ApiProperty()
  @IsString()
  city!: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @Min(0)
  @Max(1)
  @IsOptional()
  commissionRate?: number;
}

class UpdateTenantStatusDto {
  @ApiProperty({ enum: Object.values(TenantStatus) })
  @IsIn(Object.values(TenantStatus))
  status!: TenantStatus;
}

@ApiTags('租户（平台管理端）')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenants: TenantsService) {}

  @Get()
  list() {
    return ok(this.tenants.list());
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return ok(this.tenants.get(id));
  }

  @Post()
  create(@Body() dto: CreateTenantDto) {
    return ok(this.tenants.create(dto));
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateTenantStatusDto) {
    return ok(this.tenants.updateStatus(id, dto.status));
  }
}
