import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/custom/Public';
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
    return result;
    // return {
    //   code: HttpStatus.OK,
    //   data: result,
    //   message: '登录成功',
    // };
  }
}
