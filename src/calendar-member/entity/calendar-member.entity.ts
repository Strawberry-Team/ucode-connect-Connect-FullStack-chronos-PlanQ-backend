import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Index,
    Unique, OneToMany,
} from 'typeorm';
import {User} from '../../user/entity/user.entity';
import {Calendar} from '../../calendar/entity/calendar.entity';
import {BooleanTransformer} from 'src/common/transformers/BooleanTransformer';
import {EventParticipation} from "../../event-participation/entity/event-participation.entity";

export enum CalendarRole {
    OWNER = 'owner',
    EDITOR = 'editor',
    VIEWER = 'viewer'
}

export enum CalendarType {
    MAIN = 'main',
    HOLIDAY = 'holiday',
    ADDITIONAL = 'additional'
}

@Entity('calendar_members')
@Unique('calendar_users_calendar_user_uq', ['calendarId', 'userId'])
@Index('idx_calendar_members_user_id_calendar_type', ['userId', 'calendarType'])
@Index('idx_calendar_members_user_id_role', ['userId', 'role'])
export class CalendarMember {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'user_id'})
    userId: number;

    @Column({name: 'calendar_id'})
    calendarId: number;

    @Column({
        name: 'calendar_type',
        type: 'enum',
        enum: CalendarType,
        default: CalendarType.ADDITIONAL
    })
    calendarType: CalendarType;

    @Column({name: 'is_visible', type: 'bit', width: 1, default: () => "b'1'", transformer: BooleanTransformer(true)})
    isVisible?: boolean;

    @Column({
        type: 'enum',
        enum: CalendarRole,
        default: CalendarRole.VIEWER
    })
    role: CalendarRole;

    @Column({type: 'char', length: 7})
    color: string;

    @Column({
        name: 'is_confirmed',
        type: 'bit',
        width: 1,
        default: () => "b'0'",
        transformer: BooleanTransformer(false)
    })
    isConfirmed: boolean;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.userCalendars, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'user_id'})
    user: User;

    @ManyToOne(() => Calendar, (calendar) => calendar.userCalendars, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'calendar_id'})
    calendar: Calendar;

    @OneToMany(() => EventParticipation, (eventParticipation) => eventParticipation.calendarMember, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    eventParticipations: EventParticipation[];
}