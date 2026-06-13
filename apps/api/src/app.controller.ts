import { Controller, Get } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  @Get()
  root() {
    return {
      name: '丢呗 API',
      message: '接口服务运行中。这是后端 API，不是网页界面。',
      links: {
        swagger: '/api/docs',
        communities: '/api/communities',
        packages: '/api/packages/plans',
      },
      clients: {
        miniprogram: '微信开发者工具 → apps/miniprogram',
        saas: 'http://localhost:5173/login （账号 tenant / tenant123）',
        admin: 'http://localhost:5174/login （需先运行 pnpm dev:admin，账号 admin / admin123）',
      },
    };
  }
}
