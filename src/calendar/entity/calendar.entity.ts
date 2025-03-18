import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
    ManyToMany
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
    description?: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.calendars, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @OneToMany(() => UserCalendar, (userCalendar) => userCalendar.calendar, {
        cascade: true,  // Удалит записи из `users_calendars` при удалении календаря
        onDelete: 'CASCADE',
    })
    userCalendars: UserCalendar[];
}