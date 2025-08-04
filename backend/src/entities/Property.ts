import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from "typeorm";
import { TenantProfile } from "./TenantProfile";

@Entity()
export class Property {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column()
    location!: string;

    @Column()
    units!: number;

    @Column({ nullable: true })
    preferences?: string;

    @Column("decimal", { precision: 10, scale: 6, nullable: true })
    latitude?: number;

    @Column("decimal", { precision: 10, scale: 6, nullable: true })
    longitude?: number;

    @CreateDateColumn()
    createdAt!: Date;

    @OneToMany(() => TenantProfile, tenantProfile => tenantProfile.property)
    tenantProfiles!: TenantProfile[];
}