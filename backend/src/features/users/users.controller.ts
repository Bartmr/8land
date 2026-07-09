import { Controller, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/features/users/auth/auth.guard';
import { DataSource } from 'typeorm';

@UseGuards(AuthGuard)
@Controller('users')
export class UsersController {
  constructor(private dataSource: DataSource) {}

  
}
