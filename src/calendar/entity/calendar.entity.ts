// calendar/entity/calendar.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    OneToMany,
} from 'typeorm';
import {User} from '../../user/entity/user.entity';
import {CalendarMember} from '../../calendar-member/entity/calendar-member.entity';

@Entity('calendars')
export class Calendar {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'creator_id'})
    creatorId: number;

    @Column({name: 'name', length: 100})
    name: string;

    @Column({type: 'tinytext', nullable: true})
    description?: string;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.calendars, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'creator_id'})
    creator: User;

    @OneToMany(() => CalendarMember, (calendarMember) => calendarMember.calendar, {
        cascade: true,
        onDelete: 'CASCADE',
    })
    userCalendars: CalendarMember[];
}