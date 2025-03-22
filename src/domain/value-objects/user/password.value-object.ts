import { ValueObject } from '../value-object';

export class Password extends ValueObject<String> {
  private constructor(private value: string) {
    super();
  }

  public getAtomicValues(): Iterable<String> {
    return [this.value];
  }

  public static create(value: string) {
    if (!value || typeof value !== 'string' || value.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    return new Password(value);
  }

  public getValue(): string {
    return this.value;
  }

  public setValue(value: string): void {
    this.value = value;
  }
}
