import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { ok } from '../../common/response';
import { AuthGuard } from '../auth/auth.guard';
import type { TokenPayload } from '../auth/auth.service';
import { AddressesService } from './addresses.service';

class AddressDto {
  @ApiProperty()
  @IsString()
  communityId!: string;

  @ApiProperty()
  @IsString()
  building!: string;

  @ApiProperty()
  @IsString()
  unit!: string;

  @ApiProperty()
  @IsString()
  room!: string;

  @ApiProperty()
  @IsString()
  contactName!: string;

  @ApiProperty()
  @IsString()
  contactPhone!: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

@ApiTags('地址')
@Controller('addresses')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addresses: AddressesService) {}

  @Get()
  list(@Req() req: { user: TokenPayload }) {
    return ok(this.addresses.list(req.user.sub));
  }

  @Post()
  create(@Req() req: { user: TokenPayload }, @Body() dto: AddressDto) {
    return ok(this.addresses.create(req.user.sub, { ...dto, isDefault: dto.isDefault ?? false }));
  }

  @Patch(':id')
  update(
    @Req() req: { user: TokenPayload },
    @Param('id') id: string,
    @Body() dto: Partial<AddressDto>,
  ) {
    return ok(this.addresses.update(id, req.user.sub, dto));
  }

  @Delete(':id')
  remove(@Req() req: { user: TokenPayload }, @Param('id') id: string) {
    this.addresses.remove(id, req.user.sub);
    return ok(null, '已删除');
  }

  @Post(':id/default')
  setDefault(@Req() req: { user: TokenPayload }, @Param('id') id: string) {
    return ok(this.addresses.setDefault(id, req.user.sub));
  }
}
