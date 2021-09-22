import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToOne, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'

import { validateEntityInstance } from '../../utils/validateEntityInstance'
import { Property } from './Property'
import { User } from './User'
import { Document } from './Document'

@Entity()
export class Contract {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(() => User, renter => renter.rentContract, { nullable: true })
    @JoinColumn({ name: 'renterId' })
    renter: User;

    @Column({ nullable: true })
    renterId: number;

    @ManyToOne(() => Property, property => property.contracts)
    @JoinColumn({ name: 'propertyId' })
    property: Property;

    @Column()
    propertyId: number;

    @OneToOne(() => Document, document => document.contract, { cascade: true, nullable: true })
    @JoinColumn({ name: 'documentId' })
    document: Document;

    @Column({ nullable: true })
    documentId: number;

    @Column()
    dueDate: number;

    @Column({ type: "date", default: new Date() })
    startDate: Date;

    @Column({ type: "date" })
    expirationDate: Date;

    @BeforeInsert()
    async validateContract() {
        await validateEntityInstance(this)
    }
}