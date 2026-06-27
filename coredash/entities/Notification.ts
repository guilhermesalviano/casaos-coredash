import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("notifications")
export class Notification {
  @PrimaryColumn()
  id!: string;

  @Column({ type: "varchar", length: 255 })
  title!: string;

  @Column({ type: "varchar", length: 255 })
  message!: string;

  @Column()
  timestamp!: string;

  @Column({ type: "tinyint", width: 1, default: 0 })
  read!: number;

  @Column({ type: "varchar", length: 255 })
  type!: string;
}