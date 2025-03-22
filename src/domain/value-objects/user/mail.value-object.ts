import { ValueObject } from '../value-object';

export class Mail extends ValueObject<String> {
  private constructor(private value: string) {
    super();
  }

  public getAtomicValues(): Iterable<String> {
    return [this.value];
  }

  public static create(value: string) {
    return new Mail(value);
  }

  public getValue(): string {
    return this.value;
  }

  public setValue(value: string): void {
    this.value = value;
  }
}
