import { ValueObject } from './value-object';

export class Id extends ValueObject<String> {
  private constructor(private readonly value: string) {
    super();
  }

  public getAtomicValues(): Iterable<String> {
    return [this.value];
  }

  public static create(value: string) {
    return new Id(value);
  }

  public getValue(): string {
    return this.value;
  }
}
