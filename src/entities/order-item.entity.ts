import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'productid', type: 'varchar', length: 255 })
  productId: string; 

  @Column({ name: 'productpackageid', type: 'varchar', length: 255, nullable: true })
  productPackageId: string;

  @Column({ name: 'packageweight', type: 'int', nullable: true })
  packageWeight: number;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;
}
