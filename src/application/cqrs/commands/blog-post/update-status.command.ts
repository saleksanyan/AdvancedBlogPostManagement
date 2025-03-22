import { UpdateStatusInputDto } from "src/application/dtos/input/blog-post/update-status.dto";

export class UpdateStatusCommand {
  constructor(
    public readonly id: string,
    public readonly updateStatusInputDto: UpdateStatusInputDto,
  ) {}
}
