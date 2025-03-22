import { BlogPostStatusEnum } from '../enums/blog-post.enum';
import { Content } from '../value-objects/blog-post/content.value-object';
import { Title } from '../value-objects/blog-post/title.value-object';
import { Id } from '../value-objects/id.value-object';
import { CategoryModel } from './category.model';
import { UserModel } from './user.model';

export class BlogPostModel {
  private _id: Id;
  private _title: Title;
  private _content: Content;
  private _author: UserModel;
  private _caterogies: CategoryModel[];
  private _status: BlogPostStatusEnum;

  constructor(
    title: string,
    content: string,
    author: UserModel,
    categories: CategoryModel[],
    status?: BlogPostStatusEnum,
    id?: string,
  ) {
    this._id = Id.create(id);
    this._title = Title.create(title);
    this._content = Content.create(content);
    this._author = author;
    this._caterogies = categories;
    this._status = status;
  }

  get id(): Id {
    return this._id;
  }

  get title(): Title {
    return this._title;
  }

  get content(): Content {
    return this._content;
  }

  get author(): UserModel {
    return this._author;
  }

  set content(content: string) {
    this._content.setValue(content);
  }

  set title(title: string) {
    this._title.setValue(title);
  }

  get categories() {
    return this._caterogies;
  }

  get status() {
    return this._status;
  }
}
