import {
  ForbiddenException,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { AccessTokenEntity } from "../../user/entities/access-token.entity";
import { Repository } from "typeorm";
import { UserEntity } from "../../user/entities/user.entity";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(AccessTokenEntity)
    private readonly accessTokenRepository: Repository<AccessTokenEntity>,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("No token provided");
    }

    const token = authHeader.split(" ")[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!);
    } catch (error) {
      throw new UnauthorizedException("Invalid or expired token");
    }

    if (!decoded || !decoded["sub"]) {
      throw new UnauthorizedException("Invalid token payload");
    }

    const user = await this.userRepository.findOne({
      where: { id: decoded["sub"] },
    });
    if (!user) {
      throw new ForbiddenException("User not found");
    }

    const existingAccessToken = await this.accessTokenRepository.findOne({
      where: {
        user: { id: user.id },
        is_active: true,
      },
    });

    if (!existingAccessToken) {
      throw new UnauthorizedException();
    }
        
    req["user"] = user.id;
    next();
  }
}
