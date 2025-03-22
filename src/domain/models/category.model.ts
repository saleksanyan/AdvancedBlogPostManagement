import { Name } from '../value-objects/category/name.value-object';
import { Id } from '../value-objects/id.value-object';

export class CategoryModel {
  private _id: Id;
  private _name: Name;

  constructor(name: string, id?: string) {
    this._name = Name.create(name);
    this._id = Id.create(id);
  }

  get id(): Id {
    return this._id;
  }

  get name() {
    return this._name;
  }
}
