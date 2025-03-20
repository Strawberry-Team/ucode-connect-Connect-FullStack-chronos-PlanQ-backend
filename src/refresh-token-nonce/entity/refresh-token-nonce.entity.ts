import {Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, Index} from 'typeorm';
import {User} from '../../user/entity/user.entity';

@Entity('refresh_token_nonces')
@Index('idx_refresh_token_nonces_user_id_nonce', ['userId', 'nonce'])
export class RefreshTokenNonce {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({name: 'user_id'})
    userId: number;

    @ManyToOne(() => User, (user) => user.refreshTokenNonces, {onDelete: 'CASCADE'})
    @JoinColumn({name: 'user_id'})
    user: User;

    @Column({name: 'nonce', length: 64})
    nonce: string;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'created_at'})
    createdAt: Date;
}
