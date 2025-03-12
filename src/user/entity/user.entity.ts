import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany
} from 'typeorm';
import {RefreshToken} from 'src/token/entities/refresh-token.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({length: 255})
    password?: string;

    @Column({name: 'first_name', length: 100})
    firstName: string;

    @Column({name: 'last_name', length: 100, nullable: true})
    lastName?: string;

    @Column({unique: true, length: 255})
    email: string;

    @Column({
        name: 'profile_picture_name',
        length: 255,
        default: 'default-avatar.png',
    })
    profilePictureName: string;

    @Column({name: 'email_verified', type: 'bit', width: 1, default: () => "b'0'"})
    emailVerified?: boolean;

    @Column({name: 'country_code', type: 'char', length: 2})
    countryCode: string;

    @CreateDateColumn({name: 'created_at', type: 'timestamp'})
    createdAt: Date;

    @UpdateDateColumn({name: 'updated_at', type: 'timestamp'})
    updatedAt: Date;

    @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
        cascade: true,
    })
    refreshTokens: Promise<RefreshToken[]>;
}
