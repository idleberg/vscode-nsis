Number.prototype['inRange'] = inRange;

function inRange(min: number, max: number): boolean {
  return this >= min && this <= max;
}
