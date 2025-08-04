import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn } from "typeorm";
import { Property } from "./Property";
import { Amenity } from "./Amenity";

@Entity()
export class TenantProfile {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    ageRange!: string;

    @Column()
    incomeRange!: string;

    @Column({ nullable: true })
    lifestyle?: string;

    @Column("text", { array: true, default: [] })
    preferences!: string[];

    @Column({ nullable: true })
    idealTenant?: string;

    @CreateDateColumn()
    createdAt!: Date;

    @ManyToOne(() => Property, property => property.tenantProfiles)
    property!: Property;

    @ManyToMany(() => Amenity)
    @JoinTable()
    suggestedAmenities!: Amenity[];
}