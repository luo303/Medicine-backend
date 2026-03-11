import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) {}

  async signIn(username: string, pass: string): Promise<{ token: string }> {
    const user = await this.usersService.findOne(username, pass);
    const payload = { sub: user.id, username: user.username };
    const token = await this.jwtService.signAsync(payload);
    return {
      // 💡 Here the JWT secret key that's used for signing the payload
      // is the key that was passsed in the JwtModule
      token,
    };
  }
}
