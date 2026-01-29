import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  create(createUserDto: CreateUserDto) {
    return { message: `Create user ${createUserDto.email}` };
  }

  findAll() {
    return { message: 'List users' };
  }

  findOne(id: number) {
    return { message: `Get user ${id}` };
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return { message: `Update user ${id}`, payload: updateUserDto };
  }

  remove(id: number) {
    return { message: `Remove user ${id}` };
  }
}
