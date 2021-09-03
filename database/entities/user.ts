import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm'
import { IsEmail } from 'class-validator'
import bcrypt from 'bcryptjs'

import { validateEntityInstance } from '../../utils/validateEntityInstance'
import { Property } from './Property';

export enum USER_ROLES {
    SUPER_ADMIN = "SUPER_ADMIN",
    PROPERTY_ADMIN = "PROPERTY_ADMIN",
    RENTER = "RENTER"
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column({ unique: true })
    @IsEmail()
    email: string;

    @Column({ select: false })
    password: string;

    @Column()
    phone: string;

    @Column({ default: USER_ROLES.RENTER })
    role: USER_ROLES;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @OneToMany(() => Property, property => property.administrator, { cascade: true, nullable: true })
    administratedProperties: Property[];

    @BeforeInsert()
    async hashPassword() {
        const salt = await bcrypt.genSalt(10)
        this.password = await bcrypt.hash(this.password, salt)
    }

    @BeforeInsert()
    async validateUser() {
        await validateEntityInstance(this)
    }
}
