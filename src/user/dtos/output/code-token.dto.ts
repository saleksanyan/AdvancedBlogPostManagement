export class CodeTokenOutputDto {
  token: string;
  code: string;

  constructor(token: string, code: string) {
    this.token = token;
    this.code = code;
  }
}
