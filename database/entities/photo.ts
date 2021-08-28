import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToOne, JoinColumn } from 'typeorm'
import { IsUrl } from 'class-validator'

import { validateEntityInstance } from '../../utils/validateEntityInstance'
import { Property } from './property';

export enum PHOTO_TYPE {
    PROPERTY = "PROPERTY",
    BILL = "BILL"
}

export interface PhotoData {
    fieldname: PHOTO_TYPE,
    originalname: string,
    encoding: string,
    mimetype: string,
    destination: string,
    filename: string,
    path: string,
    size: number
}

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    public_id: string;

    @Column()
    @IsUrl()
    url: string;

    @Column({ enum: PHOTO_TYPE })
    type: PHOTO_TYPE;

    @Column()
    title: string;

    @ManyToOne(() => Property, property => property.photos, { nullable: true })
    property: Property;

    // TODO: add bill relation here

    @BeforeInsert()
    async validatePhoto() {
        await validateEntityInstance(this)
    }
}