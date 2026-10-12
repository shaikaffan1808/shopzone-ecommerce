import { OrderItem } from './order-item';

export interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  total: number;
  status: 'Placed' | 'Shipped' | 'Delivered' | 'Cancelled';
  orderDate: string;
  address: string;
}