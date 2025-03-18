import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { UserCalendar } from '../../user-calendar/entity/user-calendar.entity';

@Entity('calendars')
export class Calendar {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'owner_id' })
    ownerId: number;

    @Column({ length: 100 })
    name: string;

    @Column({ type: 'tinytext', nullable: true })
    description?: string | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @OneToMany(() => UserCalendar, (userCalendar) => userCalendar.calendar)
    userCalendars: UserCalendar[];
}