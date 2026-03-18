import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("webpush_subscriptions")
export class WebPush {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  endpoint!: string;

  @Column({ type: "simple-json" })
  keys!: { p256dh: string; auth: string };

  @Column({ nullable: true })
  expirationTime!: number;
}