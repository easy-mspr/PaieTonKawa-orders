import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Req } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('orders')
export class OrderController {
  constructor(
    private readonly ordersService: OrderService, 
) {}

@Post()
create(@Body() completeOrderDto: any, @Req() req: any) {
    if (!completeOrderDto.order) {
        completeOrderDto.order = {};
    }

    completeOrderDto.order.customerId = req.user.sub;
    return this.ordersService.createCompleteOrder(completeOrderDto);
}

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: any) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(+id);
  }
}
