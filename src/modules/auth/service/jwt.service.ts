import { Injectable } from '@nestjs/common';
import { JwtService as Jwt } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Attendee } from 'src/modules/attendees/entities/attendee.entity';
import { Repository } from 'typeorm';
@Injectable()
export class JwtService {
  @InjectRepository(Attendee)
  private readonly attendeeRepository: Repository<Attendee>;

  private readonly jwt: Jwt;

  constructor(jwt: Jwt) {
    this.jwt = jwt;
  }

  // Decoding the JWT Token
  public async decode(token: string): Promise<unknown> {
    return this.jwt.decode(token, null);
  }

  // Get Attendee by Attendee ID we get from decode()
  public async validateUser(decoded: any) {
    const user: Attendee = await this.attendeeRepository.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      // IF USER NOT FOUND
      return;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    };
  }

  // Generate JWT Token
  public generateToken(auth: Attendee): string {
    return this.jwt.sign({ id: auth.id, email: auth.email });
  }

  // Validate Attendee's password
  public isPasswordValid(password: string, userPassword: string): boolean {
    return bcrypt.compareSync(password, userPassword);
  }

  // Encode Attendee's password
  public encodePassword(password: string): string {
    const salt: string = bcrypt.genSaltSync(10);

    return bcrypt.hashSync(password, salt);
  }

  // Validate JWT Token, throw forbidden error if JWT Token is invalid
  public async verify(token: string): Promise<any> {
    try {
      return this.jwt.verify(token);
    } catch (err) {}
  }
}
