import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToOne, JoinColumn } from 'typeorm'
import { IsUrl } from 'class-validator'

import { validateEntityInstance } from '../../utils/validateEntityInstance'
import { Property } from './property';

export enum ITEM_TYPE {
    PROPERTY = "PROPERTY",
    BILL = "BILL"
}

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    @IsUrl()
    url: string;

    @Column({ enum: ITEM_TYPE })
    type: ITEM_TYPE;

    @ManyToOne(() => Property, property => property.photos, { nullable: true })
    property: Property;

    // TODO: add bill relation here

    @BeforeInsert()
    async validatePhoto() {
        await validateEntityInstance(this)
    }
}