import { CategoryModel } from 'src/domain/models/category.model';
import { CategoryEntity } from 'src/infastructure/entities/category.entity';

export class CategoryMapper {
  static toModel(entity: CategoryEntity): CategoryModel {
    return new CategoryModel(entity.name, entity.id);
  }

  static toEntity(model: CategoryModel): CategoryEntity {
    const categoryEntity = new CategoryEntity();
    categoryEntity.id = model.id.getValue();
    categoryEntity.name = model.name.getValue();
    return categoryEntity;
  }
}
