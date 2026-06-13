import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ok } from '../../common/response';
import { CommunitiesService } from './communities.service';

class CreateCommunityDto {
  @ApiProperty()
  @IsString()
  tenantId!: string;

  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty()
  @IsString()
  address!: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

@ApiTags('小区')
@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communities: CommunitiesService) {}

  @Get()
  @ApiQuery({ name: 'tenantId', required: false })
  @ApiQuery({ name: 'all', required: false, description: 'SAAS 端含未启用' })
  list(
    @Query('tenantId') tenantId?: string,
    @Query('all') all?: string,
  ) {
    const items = all === '1'
      ? this.communities.listAll(tenantId)
      : this.communities.listByTenant(tenantId);
    return ok(items);
  }

  @Get(':id')
  get(@Param('id') id: string) {
    return ok(this.communities.get(id));
  }

  @Post()
  create(@Body() dto: CreateCommunityDto) {
    return ok(this.communities.create(dto));
  }
}
