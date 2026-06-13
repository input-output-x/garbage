import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { OrderType } from '@garbage/shared';
import { ok } from '../../common/response';
import { InMemoryStore } from '../../store/in-memory.store';
import { AuthGuard } from '../auth/auth.guard';
import type { TokenPayload } from '../auth/auth.service';
import { ReviewsService } from './reviews.service';

class CreateReviewDto {
  @ApiProperty()
  @IsIn(Object.values(OrderType))
  orderType!: OrderType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  planName?: string;

  @ApiProperty()
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiProperty()
  @IsString()
  content!: string;
}

@ApiTags('评价')
@Controller('reviews')
export class ReviewsController {
  constructor(
    private readonly reviews: ReviewsService,
    private readonly store: InMemoryStore,
  ) {}

  @Get()
  @ApiQuery({ name: 'limit', required: false })
  list(@Query('limit') limit?: number) {
    return ok(this.reviews.list(Number(limit) || 10));
  }

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  create(@Req() req: { user: TokenPayload }, @Body() dto: CreateReviewDto) {
    const wxUser = this.store.users.get(req.user.sub);
    return ok(
      this.reviews.create({
        userId: req.user.sub,
        nickname: wxUser?.nickname || '微信用户',
        ...dto,
      }),
    );
  }
}
