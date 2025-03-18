import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
    Unique
} from 'typeorm';
import { User } from '../../user/entity/user.entity';
import { Calendar } from '../../calendar/entity/calendar.entity';

export enum CalendarRole {
    OWNER = 'owner',
    EDITOR = 'editor',
    VIEWER = 'viewer'
}

@Entity('users_calendars')
@Unique('calendar_users_calendar_user_uq', ['calendarId', 'userId'])
@Index('idx_calendars_users_user_id_is_main', ['userId', 'isMain'])
export class UserCalendar {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'user_id' })
    userId: number;

    @Column({ name: 'calendar_id' })
    calendarId: number;

    @Column({ name: 'is_main', type: 'bit', width: 1, default: () => "b'0'" })
    isMain: boolean;

    @Column({
        type: 'enum',
        enum: CalendarRole,
        default: CalendarRole.VIEWER
    })
    role: CalendarRole;

    @Column({ type: 'char', length: 7 })
    color: string;

    @Column({ name: 'is_confirmed', type: 'bit', width: 1, default: () => "b'0'" })
    isConfirmed: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Calendar)
    @JoinColumn({ name: 'calendar_id' })
    calendar: Calendar;
}