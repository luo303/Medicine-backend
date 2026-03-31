import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../custom/Public';
import { SignDto } from './dto/sign.dto';
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async signIn(@Body() signInDto: SignDto) {
    console.log(signInDto);

    const result = await this.authService.signIn(
      signInDto.username,
      signInDto.password,
    );
    console.log(result);
    return {
      data: result,
      message: '登录成功',
    };
  }
  @Public()
  @HttpCode(201)
  @Post('/register')
  async signUp(@Body() signUpDto: SignDto) {
    console.log(signUpDto);
    const result = await this.authService.signUp(signUpDto);
    console.log(result);
    return {
      data: result,
      message: '注册成功',
    };
  }
}
