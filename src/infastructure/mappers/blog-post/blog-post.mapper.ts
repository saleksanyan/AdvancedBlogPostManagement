import { BlogPostModel } from '../../../domain/models/blog-post.model';
import { UserMapper } from '../user/user.mapper';
import { CategoryMapper } from '../category/category.mapper';
import { BlogPostEntity } from 'src/infastructure/entities/blog-post.entity';

export class BlogPostMapper {
  static toModel(entity: BlogPostEntity): BlogPostModel {
    return new BlogPostModel(
      entity.title,
      entity.content,
      UserMapper.toModel(entity.author),
      entity.categories.map((category) => CategoryMapper.toModel(category)),
      entity.status,
      entity.id,
    );
  }

  static toEntity(model: BlogPostModel): BlogPostEntity {
    const postEntity = new BlogPostEntity();
    postEntity.id = model.id.getValue();
    postEntity.title = model.title.getValue();
    postEntity.content = model.content.getValue();
    postEntity.author = UserMapper.toEntity(model.author);
    postEntity.categories = model.categories.map((category) =>
      CategoryMapper.toEntity(category),
    );

    return postEntity;
  }
}
