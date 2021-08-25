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

    @ManyToOne(() => Property, property => property.photos, { nullable: true })
    property: Property;

    @BeforeInsert()
    async validatePhoto() {
        await validateEntityInstance(this)
    }
}