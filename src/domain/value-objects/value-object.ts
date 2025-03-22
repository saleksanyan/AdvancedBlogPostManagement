export abstract class ValueObject<T> {
  public abstract getAtomicValues(): Iterable<T>;

  public equals(other?: ValueObject<T>): boolean {
    if (!other) {
      return false;
    }
    return this.valuesAreEqual(other);
  }

  private valuesAreEqual(other: ValueObject<T>): boolean {
    const thisValues = Array.from(this.getAtomicValues());
    const otherValues = Array.from(other.getAtomicValues());
    return (
      thisValues.length === otherValues.length &&
      thisValues.every((value, index) => value === otherValues[index])
    );
  }

  public getHashCode(): number {
    return Array.from(this.getAtomicValues()).reduce(
      (hash, value) => this.combineHashCodes(hash, this.hashValue(value)),
      0,
    );
  }

  private combineHashCodes(hash: number, newHash: number): number {
    return (hash << 5) - hash + newHash;
  }

  private hashValue(value: any): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return Math.floor(value);
    if (typeof value === 'string')
      return Array.from(value).reduce(
        (hash, char) => hash + char.charCodeAt(0),
        0,
      );
    if (value instanceof ValueObject) return value.getHashCode();
    throw new Error(`Unsupported value type for hashing: ${typeof value}`);
  }
}
