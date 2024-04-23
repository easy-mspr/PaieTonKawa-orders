import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { OrderItem } from './order-item.entity';
  
  @Entity('orders')
  export class Order {
    @PrimaryGeneratedColumn()
    id: number;
  
    @CreateDateColumn({ name: 'createdat', type: 'timestamp' })
    createdAt: Date;
  
    @UpdateDateColumn({ name: 'updatedat', type: 'timestamp' })
    updatedAt: Date;
  
    @Column({ name: 'customerid', type: 'varchar', length: 255 })
    customerId: string;
  
    @Column({ type: 'varchar', length: 255 })
    status: string;
  
    @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
    items: OrderItem[];
  
    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total: number;
}

  