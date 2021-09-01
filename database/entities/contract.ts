import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToOne, CreateDateColumn } from 'typeorm'

import { validateEntityInstance } from '../../utils/validateEntityInstance'
import { Property } from './property'
import { User } from './user'

@Entity()
export class Contract {
    @PrimaryGeneratedColumn()
    id: number;

    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(() => User)
    renter: User;

    @OneToOne(() => User)
    propertyOwner: User;

    @OneToOne(() => Property)
    property: Property;

    @Column({ type: "date" })
    rentData: Date;

    @Column()
    url: string;

    @BeforeInsert()
    async validateContract() {
        await validateEntityInstance(this)
    }
}