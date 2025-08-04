import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Amenity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    name!: string;

    @Column("decimal", { precision: 10, scale: 2 })
    estimatedCost!: number;

    @Column({ nullable: true })
    description?: string;

    @Column({ default: 'general' })
    category!: string;

    @Column("text", { array: true, default: [] })
    targetDemographics!: string[];
}