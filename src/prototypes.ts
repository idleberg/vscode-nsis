String.prototype['inRange'] = inRange;

function inRange(min: string | number, max: string | number): boolean {
  return this >= parseInt(String(min), 10) && this <= parseInt(String(max), 10);
}

