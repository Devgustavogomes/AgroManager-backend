import { UnprocessableEntityException } from '@nestjs/common';

export class Area {
  private readonly area: number;

  constructor(parsedArea: number) {
    this.area = parsedArea;
  }

  public static fromFloat(rawArea: number) {
    if (rawArea < 0) {
      throw new UnprocessableEntityException('Area cannot be less than zero');
    }

    const parsedArea = Math.round(rawArea * 100);

    return new Area(parsedArea);
  }

  public static fromInteger(rawArea: number) {
    return new Area(rawArea);
  }

  add(otherArea: Area) {
    const newArea = this.area + otherArea.getIntegerValue();

    return new Area(newArea);
  }

  getIntegerValue(): number {
    return this.area;
  }

  getFloatValue(): number {
    return this.area / 100;
  }
}
