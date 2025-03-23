// src/event-participation/entity/event-participation.entity.ts
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
    Unique,
} from 'typeorm';
import { CalendarMember } from '../../calendar-member/entity/calendar-member.entity';
import { Event } from '../../event/entity/event.entity';

export enum ResponseStatus {
    INVITED = 'invited',
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    DECLINED = 'declined'
}

@Entity('event_participations') //TODO: переименовать все на event_participants
@Unique('calendar_members_events_calendar_member_id_event_id_uq', ['calendarMemberId', 'eventId'])
export class EventParticipation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'calendar_member_id' })
    calendarMemberId: number;

    @Column({ name: 'event_id' })
    eventId: number;

    @Column({ type: 'char', length: 7 })
    color: string;

    @Column({
        name: 'response_status',
        type: 'enum',
        enum: ResponseStatus,
        nullable: true
    })
    responseStatus?: ResponseStatus;

    @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
    updatedAt: Date;

    @ManyToOne(() => CalendarMember, (calendarMember) => calendarMember.eventParticipations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'calendar_member_id' })
    calendarMember: CalendarMember;

    @ManyToOne(() => Event, (event) => event.participations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'event_id' })
    event: Event;
}
