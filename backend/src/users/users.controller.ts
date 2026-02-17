import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async syncUser(@Body() body: { email: string; name: string }) {
    console.log("🔥 REÇU ! Le frontend a réussi à passer le mur :", body.email);
    return this.usersService.syncUser(body);
  }
}