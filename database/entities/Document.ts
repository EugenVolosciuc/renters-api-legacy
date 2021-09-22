import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, ManyToOne, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm'
import { IsUrl } from 'class-validator'

import { validateEntityInstance } from '../../utils/validateEntityInstance'
import { Bill } from './Bill';
import { Contract } from './Contract';

export enum DOCUMENT_TYPE {
    CONTRACT = "CONTRACT",
    BILL = "BILL"
}

export interface DocumentData {
    fieldname: DOCUMENT_TYPE,
    originalname: string,
    encoding: string,
    mimetype: string,
    destination: string,
    filename: string,
    path: string,
    size: number
}

@Entity()
export class Document {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    public_id: string;

    @Column()
    @IsUrl()
    url: string;

    @Column({ enum: DOCUMENT_TYPE })
    type: DOCUMENT_TYPE;

    @Column()
    title: string;

    @CreateDateColumn()
    createdAt: Date;

    @OneToOne(() => Contract, contract => contract.document, { nullable: true })
    @JoinColumn({ name: 'contractId' })
    contract: Contract;

    @Column({ nullable: true })
    contractId: number;

    // TODO: add bill relation here
    @ManyToOne(() => Bill, bill => bill.photos, { nullable: true })
    bill: Bill;

    @BeforeInsert()
    async validateDocument() {
        await validateEntityInstance(this)
    }
}