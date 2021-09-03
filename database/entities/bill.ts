import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, ManyToOne, OneToMany } from 'typeorm'

import { validateEntityInstance } from '../../utils/validateEntityInstance'
import { Property } from './Property'
import { Photo } from './Photo'

export enum BILL_TYPES {
    RENT = "RENT",
    ELECTRICITY = "ELECTRICITY",
    WATER = "WATER",
    GAS = "GAS",
    TRASH = "TRASH",
    INTERNET = "INTERNET",
    SECURITY = "SECURITY",
    ASSOCIATION = "ASSOCIATION"
}

@Entity()
export class Bill {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    type: BILL_TYPES;

    @Column({ type: 'real' })
    cost: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Photo, photo => photo.property, { cascade: true, nullable: true })
    photos: Photo[];

    @ManyToOne(() => Property, property => property.bills)
    property: Property;

    @BeforeInsert()
    async validateBill() {
        await validateEntityInstance(this)
    }
}