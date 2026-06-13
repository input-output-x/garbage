import { Body, Controller, Post } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { ok } from '../../common/response';
import { AuthService } from './auth.service';

class WxLoginDto {
  @ApiProperty({ description: 'wx.login 返回的 code' })
  @IsString()
  @IsOptional()
  code?: string;
}

class AdminLoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  username!: string;

  @ApiProperty({ example: 'admin123' })
  @IsString()
  @MinLength(6)
  password!: string;
}

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('wx/login')
  wxLogin(@Body() dto: WxLoginDto) {
    const result = this.auth.wxLogin(dto.code ?? 'dev');
    return ok(result);
  }

  @Post('admin/login')
  adminLogin(@Body() dto: AdminLoginDto) {
    const result = this.auth.adminLogin(dto.username, dto.password);
    return ok(result);
  }
}
