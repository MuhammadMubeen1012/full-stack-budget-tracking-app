import { ForbiddenException, Injectable } from '@nestjs/common';
import { AuthDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { response } from 'express';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}
  async signUp(dto: AuthDto) {
    try {
      //hash is generated
      const hash = await argon.hash(dto.password);

      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash: hash,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      });

      return this.signToken(user.id, user.email, user.firstName, user.lastName);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signIn(dto: AuthDto) {
    console.log({
      email: dto.email,
      password: dto.password,
    });
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      console.log('User not found');
      throw new ForbiddenException('Credientials Incorrect');
    }

    const pwMatches = await argon.verify(user.hash, dto.password);

    if (!pwMatches) {
      console.log('Password not matches');
      throw new ForbiddenException('Credentials incorrect');
    }

    console.log('Credientials Correct --> Signing Password');
    return this.signToken(user.id, user.email, user.firstName, user.lastName);
  }

  //we created token, we need to have strategy to validate token on all of the requests made by user
  async signToken(
    id: number,
    email: string,
    firstName: string,
    lastName: string,
  ): Promise<{ access_token: string; user }> {
    const payload = {
      sub: id,
      email,
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret,
    });

    console.log('Token --> ', token);
    return {
      user: {
        id: id,
        email: email,
        firstName: firstName,
        lastName: lastName,
      },
      access_token: token,
    };
  }

  async googleLogin(req, res) {
    if (!req.user) {
      return 'No user from google';
    } else {
      console.log('User is: ', req.user);
      const signedUser = await this.signToken(
        req.user.id,
        req.user.email,
        req.user.firstName,
        req.user.lastName,
      );
      res.redirect(
        `http://localhost:3000?userId=${signedUser.user.id}&token=${signedUser.access_token}`,
      );
      return signedUser;
    }
  }

  async validateUser(userCredientials: any) {
    console.log('AuthService');
    console.log('User is: ', userCredientials);

    const user = await this.prisma.user.findFirst({
      where: {
        email: userCredientials.email,
      },
    });

    if (user) {
      console.log('User found ---> ', user);
      return user;
    }

    console.log('User not found. Creating User --->');

    const newUser = await this.prisma.user.create({
      data: {
        email: userCredientials.email,
        hash: 'si-secret@google',
        firstName: userCredientials.firstName,
        lastName: userCredientials.lastName,
      },
    });

    return newUser;
  }

  async getUser(id) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    if (user) {
      return user;
    } else {
      return null;
    }
  }
}
