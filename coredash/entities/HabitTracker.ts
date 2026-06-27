import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity("habit_tracker")
export class HabitTracker {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  createdAt!: Date;

  @Column()
  habit!: string;

  @Column({ type: "varchar", nullable: true })
  maxStreak!: string | null;
}