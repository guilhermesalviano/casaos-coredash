import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne } from "typeorm";
import { TodoRecurrence } from "./TodoRecurrence";

@Entity("todos")
export class Todo {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  title!: string;

  @Column({ type: "varchar", nullable: true })
  priority!: string | null;

  @Column()
  createdAt!: Date;

  @Column({ type: "varchar", nullable: true })
  sponsor!: string | null;

  @OneToOne(() => TodoRecurrence, { cascade: true })
  @JoinColumn()
  recurrence!: TodoRecurrence;
}