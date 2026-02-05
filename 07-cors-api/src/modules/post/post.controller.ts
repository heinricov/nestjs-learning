import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  ParseIntPipe,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PostService } from './post.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto) {
    const created = await this.postService.create(createPostDto);
    return [
      {
        statusCode: HttpStatus.CREATED,
        data: created,
      },
    ];
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const posts = await this.postService.findAll();
    return [
      {
        statusCode: HttpStatus.OK,
        count: posts.length,
        updatedAt: await this.postService.getLastUpdatedAt(),
        data: posts,
      },
    ];
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const post = await this.postService.findOne(id);
    if (!post) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Post not found',
      };
    }
    return [
      {
        statusCode: HttpStatus.OK,
        data: post,
      },
    ];
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const updated = await this.postService.update(id, updatePostDto);
    if (!updated) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Post not found',
      };
    }
    return [
      {
        statusCode: HttpStatus.OK,
        data: updated,
      },
    ];
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    const ok = await this.postService.remove(id);
    if (!ok) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Post not found',
      };
    }
    return [
      {
        statusCode: HttpStatus.OK,
        message: 'Post deleted successfully',
      },
    ];
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  async removeAll() {
    const count = await this.postService.removeAll();
    if (count === 0) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Post not found',
      };
    }
    return [
      {
        statusCode: HttpStatus.OK,
        message: 'All posts deleted successfully',
      },
    ];
  }
}
