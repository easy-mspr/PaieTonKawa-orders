import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from 'src/entities/order-item.entity';
import { OrderService } from 'src/order/order.service';

@Injectable()
export class OrderItemsService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private orderService: OrderService
  ) {}

  async create(orderId: number, itemData: any): Promise<OrderItem[]> {
    const item = this.orderItemsRepository.create({
      ...itemData,
      order: { id: orderId }
    });

    const itemSave = this.orderItemsRepository.save(item)
    await this.orderService.calculateTotal(orderId);
    return itemSave;
  }

  async findAllByOrderId(orderId: number): Promise<OrderItem[]> {
    return this.orderItemsRepository.find({
      where: { order: { id: orderId } }
    });
  }

  async findOne(id: number): Promise<OrderItem> {
    return this.orderItemsRepository.findOne({where : {id}});
  }

  async update(id: number, itemData: any): Promise<OrderItem> {
    await this.orderItemsRepository.update(id, itemData);
    const orderItem = await this.findOne(id);

    await this.orderService.calculateTotal(orderItem.id);
    return orderItem;
  }

  async remove(orderId:number, id: number): Promise<void> {
    await this.orderService.calculateTotal(orderId);
    await this.orderItemsRepository.delete(id);
  }
}
