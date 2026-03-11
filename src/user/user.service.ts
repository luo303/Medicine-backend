import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './user.entity';
import { Repository } from 'typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findAll() {
    const users = await this.userRepository.find();
    return users;
  }
  async findOne(username: string, password: string) {
    const user = await this.userRepository.findOne({
      where: {
        username,
      },
    });
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
        },
        HttpStatus.NOT_FOUND,
      );
    } else if (user.password !== password) {
      throw new HttpException(
        {
          status: HttpStatus.UNAUTHORIZED,
          message: 'Password not match',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
    return user;
  }
  async create(user: User) {
    const userTmp = this.userRepository.create(user);
    const result = await this.userRepository.save(userTmp);
    return result;
  }
  async update(id: number, user: Partial<User>) {
    const result = await this.userRepository.update(id, user);
    return result;
  }
  async remove(id: number) {
    const result = await this.userRepository.delete(id);
    return result;
  }
}
