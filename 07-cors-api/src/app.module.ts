import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database/typeormConfig';
import { PostModule } from './modules/post/post.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), PostModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
