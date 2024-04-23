import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from 'src/entities/order.entity';
import { OrderItem } from 'src/entities/order-item.entity';
import { RabbitMQService } from 'src/rabbitmq/rabbitmq.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private rabbitMQService: RabbitMQService,
  ) {

    this.rabbitMQService.subscribeToQueue('products_to_orders_availability_response', (message) => this.handleProductAvailabilityResponse(message));
  }

  async create(orderData: Order): Promise<Order> {
    const order = this.ordersRepository.create(orderData);
    
    return await this.ordersRepository.save(order);
  }
  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({ relations: ['items'] });
  }

  async findOne(id: number): Promise<Order> {
    return this.ordersRepository.findOne({ where: {id}, relations: ['items'] });
  }

  async update(id: number, orderData: any): Promise<Order> {
    await this.ordersRepository.update(id, orderData);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.ordersRepository.delete(id);
  }


  async calculateTotal(orderId: number): Promise<number> {
    const order = await this.ordersRepository.findOne({ where: {id: orderId}, relations: ['items'],
    });
    if (!order) {
      throw new Error('Order not found');
    }

    const total = order.items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    order.total = total;
    await this.ordersRepository.save(order);
    return total;
  }

  async createCompleteOrder(completeOrderDto: any) {
    if (!completeOrderDto.items || completeOrderDto.items.length === 0) {
      throw new Error('Impossible de créer une commande sans produits.');
    }

    let order = await this.create({...completeOrderDto.order, status: 'work in progress', total: 0.0 });
  
    const itemsData = {
      orderId: order.id,
      items: completeOrderDto.items
    };
  
    try {
      const published = await this.rabbitMQService.publishToQueue('orders_to_products_check_availability', itemsData);
      if (!published) {
        throw new Error('Failed to publish message');
      }
    } catch (error) {
      await this.ordersRepository.delete(order.id);
      throw new Error('Erreur lors de la mise en queue du message, commande annulée: ' + error.message);
    }
  
    return order;
  }

  async handleProductAvailabilityResponse(message) {
    const data = JSON.parse(message.content.toString());
  
    if (!data.creationPossible) {
      await this.ordersRepository.update(data.orderId, { status: 'cancelled' });
      return 'Commande annulée, un ou plusieurs produits sont indisponibles.';
    }
  
    for (const item of data.items) {
      const itemSave = this.orderItemsRepository.create({
        ...item,
        order: { id: data.orderId }
      });
      await this.orderItemsRepository.save(itemSave);
    }
  
    const total = await this.calculateTotal(data.orderId);
  
    await this.ordersRepository.update(data.orderId, { status: 'completed', total });
  
    return { ...data, total };
  }
}

