import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToOne, JoinColumn, OneToMany, ManyToOne } from 'typeorm'

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

    @Column({ nullable: true, type: 'int' })
    rooms: number;

    @Column({ enum: PROPERTY_TYPES })
    type: PROPERTY_TYPES;

    @Column()
    address: string;

    @Column({ nullable: true, type: 'int' })
    floor: number;

    @Column({ nullable: true, type: 'int' })
    floors: number;

    @Column({ nullable: true, type: 'real' })
    floorArea: number;

    @Column({ type: 'real' })
    rentPrice: number;

    // @OneToOne(() => User)
    @ManyToOne(() => User, administrator => administrator.administratedProperties, { nullable: true })
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
    billTypes: BILL_TYPES;

    @OneToMany(() => Photo, photo => photo.property, { cascade: true, nullable: true })
    photos: Photo[];

    @OneToMany(() => Bill, bill => bill.property, { cascade: true, nullable: true })
    bills: Bill[];

    @BeforeInsert()
    async validateProperty() {
        await validateEntityInstance(this)
    }
}