import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 180 })
  title: string;

  @ManyToOne(() => User, (user) => user.posts, { onDelete: 'SET NULL' })
  author?: User;
}
