import { PipeTransform, Injectable, NotFoundException } from "@nestjs/common";
import { isUUID } from "class-validator";

@Injectable()
export class CheckUUIDPipe implements PipeTransform<string> {
  transform(value: string): string {
    if (value != undefined && !isUUID(value)) {
      throw new NotFoundException();
    }
    return value;
  }
}
