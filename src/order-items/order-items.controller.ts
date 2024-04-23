import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { OrderItemsService } from './order-items.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('orders/:orderId/items')
export class OrderItemsController {
  constructor(private readonly orderItemsService: OrderItemsService) {}

  @Post()
  create(@Param('orderId') orderId: string, @Body() createItemDto: any) {
    return this.orderItemsService.create(+orderId, createItemDto);
  }

  @Get()
  findAllByOrderId(@Param('orderId') orderId: string) {
    return this.orderItemsService.findAllByOrderId(+orderId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderItemsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateItemDto: any) {
    return this.orderItemsService.update(+id, updateItemDto);
  }

  @Delete(':id')
  remove(@Param('orderId') orderId: string, @Param('id') id: string) {
    return this.orderItemsService.remove(+orderId, +id);
  }
}
