import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert } from 'typeorm'

import { validateEntityInstance } from '../../utils/validateEntityInstance'

@Entity()
export class CronJob {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    action: string;

    @Column()
    interval: string;

    @Column({ default: true })
    isRunning: boolean;

    @BeforeInsert()
    async validateCron() {
        await validateEntityInstance(this)
    }
}