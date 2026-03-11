import { Inject, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { TOKENS } from '../../contain';
import { HttpException, HttpStatus } from '@nestjs/common';
@Injectable()
export class UserService {
  constructor(
    @Inject(TOKENS.USER_REPOSITORY)
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
  async findProfile(id: number) {
    const profile = await this.userRepository.findOne({
      where: {
        id,
      },
      relations: ['profile'],
    });
    if (!profile) {
      throw new HttpException(
        {
          status: HttpStatus.NOT_FOUND,
          message: 'Profile not found',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return profile;
  }
}
