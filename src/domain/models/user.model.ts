import { Id } from '../value-objects/id.value-object';
import { Mail } from '../value-objects/user/mail.value-object';
import { Password } from '../value-objects/user/password.value-object';
import { Username } from '../value-objects/user/username.value-object';

export class UserModel {
  private _id: Id;
  private _username: Username;
  private _password: Password;
  private _mail: Mail;

  constructor(username: string, password: string, mail: string, id?: string) {
    this._id = Id.create(id);
    this._username = Username.create(username);
    this._password = Password.create(password);
    this._mail = Mail.create(mail);
  }

  get id(): Id {
    return this._id;
  }

  get username(): Username {
    return this._username;
  }

  get password(): Password {
    return this._password;
  }

  get mail(): Mail {
    return this._mail;
  }

  set mail(mail: string) {
    this._mail = Mail.create(mail);
  }

  set username(username: string) {
    this._username.setValue(username);
  }

  set password(password: string) {
    this._password.setValue(password);
  }
}
