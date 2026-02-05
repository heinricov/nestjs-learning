import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly repo: Repository<Post>,
  ) {}

  create(dto: CreatePostDto) {
    const now = new Date();
    const post = this.repo.create({
      title: dto.title,
      content: dto.content,
      createdAt: now,
      updatedAt: now,
    });
    return this.repo.save(post);
  }

  findAll() {
    return this.repo.find({ order: { id: 'ASC' } });
  }

  findOne(id: number) {
    return this.repo.findOneBy({ id });
  }

  update(id: number, dto: UpdatePostDto) {
    return this.repo.findOneBy({ id }).then(async (post) => {
      if (!post) return null;
      if (dto.title !== undefined) post.title = dto.title;
      if (dto.content !== undefined) post.content = dto.content;
      post.updatedAt = new Date();
      return this.repo.save(post);
    });
  }

  remove(id: number) {
    return this.repo.delete(id).then((res) => (res.affected ?? 0) > 0);
  }

  removeAll() {
    return this.repo.count().then(async (count) => {
      await this.repo.clear();
      return count;
    });
  }

  getLastUpdatedAt() {
    return this.repo
      .find({ order: { updatedAt: 'DESC' }, take: 1 })
      .then((rows) => (rows[0]?.updatedAt ?? new Date(0)).toISOString());
  }
}
