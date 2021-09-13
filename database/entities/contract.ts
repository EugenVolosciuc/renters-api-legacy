import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToOne, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm'

import { validateEntityInstance } from '../../utils/validateEntityInstance'
import { Property } from './Property'
import { User } from './User'

@Entity()
export class Contract {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(() => User, renter => renter.rentContract, { nullable: true })
    @JoinColumn()
    renter: User;

    @Column({ nullable: true })
    renterId: number;

    @ManyToOne(() => Property, property => property.contracts)
    property: Property;

    @Column()
    propertyId: number;

    @Column()
    dueDate: number;

    @Column({ type: "date" })
    expirationDate: Date;

    @Column({ nullable: true })
    url: string;

    @BeforeInsert()
    async validateContract() {
        await validateEntityInstance(this)
    }
}