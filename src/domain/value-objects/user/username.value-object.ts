import { ValueObject } from '../value-object';

export class Username extends ValueObject<String> {
  private constructor(private value: string) {
    super();
  }

  public getAtomicValues(): Iterable<String> {
    return [this.value];
  }

  public static create(value: string) {
    if (!value || typeof value !== 'string' || value.length === 0) {
      throw new Error('Username should be a string and cannot be empty');
    }

    return new Username(value);
  }

  public getValue(): string {
    return this.value;
  }

  public setValue(value: string): void {
    this.value = value;
  }
}
