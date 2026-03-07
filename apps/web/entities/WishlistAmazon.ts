import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("wishlist_amazon")
export class WishlistAmazon {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column()
  price!: string;

  @Column()
  link!: string;

  @CreateDateColumn({ nullable: true })
  searchDate!: Date;
}