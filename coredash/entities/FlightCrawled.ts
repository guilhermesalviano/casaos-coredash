import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from "typeorm";

@Entity("flight_crawled")
export class FlightCrawled {
  @PrimaryGeneratedColumn()
  id!: number;

  @CreateDateColumn({ nullable: true })
  searchDate!: Date;

  @Column()
  airline!: string;

  @Column()
  stops!: number;

  @Column()
  origin!: string;

  @Column()
  destination!: string;

  @Column()
  price!: string;

  @Column()
  flightDate!: string;
}