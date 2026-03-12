import { Controller, Get, HttpCode, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @HttpCode(201)
  getUsers(): any {
    return this.userService.findAll();
  }

  @Get('/testHttpException')
  testHttpException(): any {
    throw new HttpException(
      {
        status: HttpStatus.FORBIDDEN,
        message: 'This is a custom message',
      },
      HttpStatus.FORBIDDEN,
    );
  }

  @Post()
  addUser(): any {
    const user = {
      username: 'admin',
      password: '123456',
    } as User;

    return this.userService.create(user);
  }
}
