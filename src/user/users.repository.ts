import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {User} from './entity/user.entity';

@Injectable()
export class UsersRepository {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<User>,
    ) {
    }

    async findById(id: number): Promise<User | null> {
        return this.repo.findOne({where: {id}});
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.repo.findOne({where: {email}});
    }

    async createUser(data: Partial<User>): Promise<User> {
        const user = this.repo.create(data);
        return this.repo.save(user);
    }

    async updateUser(id: number, updateData: Partial<User>): Promise<User | null> {
        await this.repo.update(id, updateData);
        return this.findById(id);
    }

    async deleteUser(id: number): Promise<void> {
        await this.repo.delete(id);
    }
}
