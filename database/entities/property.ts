import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToOne, JoinColumn, OneToMany } from 'typeorm'

import { validateEntityInstance } from '../../utils/validateEntityInstance'
import { User } from './user'
import { Photo } from './photo'
import { Bill, BILL_TYPES } from './bill'

export enum PROPERTY_TYPES {
    HOUSE = "HOUSE",
    APARTMENT = "APARTMENT",
    OFFICE = "OFFICE"
}

@Entity()
export class Property {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    numberOfRooms: number;

    @OneToOne(() => User)
    @JoinColumn()
    administrator: User;

    @Column()
    administratorId: number;

    @OneToOne(() => User, { nullable: true })
    @JoinColumn()
    renter: User;

    @Column({ nullable: true })
    renterId: number;

    @Column({ 
        enum: BILL_TYPES, 
        default: [
            BILL_TYPES.RENT,
            BILL_TYPES.ELECTRICITY,
            BILL_TYPES.GAS,
            BILL_TYPES.WATER
        ]
    })
    billTypes: BILL_TYPES

    @OneToMany(() => Photo, photo => photo.property, { cascade: true })
    photos: Photo[];

    @OneToMany(() => Bill, bill => bill.property, { cascade: true })
    bills: Bill[];

    @BeforeInsert()
    async validateProperty() {
        await validateEntityInstance(this)
    }
}