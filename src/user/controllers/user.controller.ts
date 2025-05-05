import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  HttpStatus,
  HttpCode,
  UseFilters,
  Query,
  Req,
  Patch,
  Delete,
} from "@nestjs/common";
import {
  DEFAULT_LIMIT,
  DEFAULT_PAGE,
} from "../../core/constants/pagination.constant";
import { CreateUserInputDto } from "../dtos/input/create-user.dto";
import { UpdateUserInputDto } from "../dtos/input/update-user.dto";
import { UserOutputDto } from "../dtos/output/user.dto";
import { UserService } from "src/user/services/user.service";
import { CheckUUIDPipe } from "src/core/pipes/check-uuid-pipe";
import { HttpExceptionFilter } from "src/core/exception-filter/http.exception-filter";
import { ForgetPasswordDto } from "src/user/dtos/input/forget-password.dto";
import { LoginDto } from "src/user/dtos/input/login.dto";
import { ResetPasswordDto } from "src/user/dtos/input/reset-password.dto";
import { VerificationCodeDto } from "src/user/dtos/input/verification-code.dto";
import { CodeTokenOutputDto } from "src/user/dtos/output/code-token.dto";
import { UsersWithCount } from "../dtos/output/user.return-type";
import { UserPostOutputDto } from "../dtos/output/user-post.dto";

@UseFilters(HttpExceptionFilter)
@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @HttpCode(HttpStatus.OK)
  @Get("/list")
  async getUserList(
    @Query("page") page = DEFAULT_PAGE,
    @Query("limit") limit = DEFAULT_LIMIT,
  ): Promise<UsersWithCount> {
    return await this.userService.list(page, limit);
  }

  @HttpCode(200)
  @Get("/verify")
  async resendVerificationCode(
    @Req() req: Request,
  ) {    
    const userId = (req as any).user;
    return await this.userService.resendCode(
      userId,
    );
  }

  @Get("/:id")
  async getUserById(
    @Param("id", CheckUUIDPipe) id: string,
  ): Promise<UserPostOutputDto> {
    return await this.userService.getById(id);
  }

  @Get()
  async getUser(
    @Req() req: Request,
  ): Promise<UserPostOutputDto> {
    const userId = (req as any).user;
    return await this.userService.getById(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body() body: CreateUserInputDto,
  ): Promise<CodeTokenOutputDto> {
    return await this.userService.register(body);
  }

  @Delete()
  @HttpCode(204)
  async deletePost(@Req() req: Request): Promise<void> {
    const userId = (req as any).user;
    await this.userService.delete(userId);
  }

  @Put(":id")
  async update(
    @Param("id", CheckUUIDPipe) id: string,
    @Body() body: UpdateUserInputDto,
  ): Promise<UserOutputDto> {
    return await this.userService.update(id, body);
  }

  @HttpCode(201)
  @Post("login")
  async loginWithEmailPassword(
    @Req() req: Request,
    @Body() emailAndPassword: LoginDto,
  ) {
    return await this.userService.loginWithEmailPassword(
      emailAndPassword.username,
      emailAndPassword.password,
    );
  }

  @HttpCode(200)
  @Patch("login")
  async loginWithVerficationCode(
    @Body() verificationCodeDto: VerificationCodeDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user;
    return await this.userService.loginWithVerficationCode(
      verificationCodeDto.code,
      userId,
    );
  }

  @HttpCode(200)
  @Patch("/register")
  async registerWithVerficationCode(
    @Body() verificationCodeDto: VerificationCodeDto,
    @Req() req: Request,
  ) {
    const userId = (req as any).user;
    return await this.userService.registerWithVerficationCode(
      verificationCodeDto.code,
      userId,
    );
  }

  @HttpCode(200)
  @Patch("logout")
  async logout(@Req() req: Request) {
    const userId = (req as any).user;
    await this.userService.logout(userId);
  }

  @HttpCode(201)
  @Post("forget-password")
  async forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return await this.userService.forgetPassword(forgetPasswordDto.email);
  }

  @HttpCode(200)
  @Patch("reset-password")
  async resetPassword(
    @Req() req: Request,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    const userId = (req as any).user;

    return await this.userService.resetPassword(
      userId,
      resetPasswordDto.password,
      resetPasswordDto.confirmPassword,
    );
  }
}
