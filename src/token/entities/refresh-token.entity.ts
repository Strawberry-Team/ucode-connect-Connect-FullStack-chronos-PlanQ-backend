import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne} from 'typeorm';
import {User} from '../../user/entity/user.entity';

@Entity('refresh_tokens')
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'user_id'})
    userId: number;

    @ManyToOne(() => User, (user) => user.refreshTokens, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'user_id'})
    user: User;

    @Column({name: 'refresh_token', type: 'text'})
    refreshToken: string;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at'})
    createdAt: Date;
}
