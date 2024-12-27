import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { Repository } from 'typeorm';
import {
  EmailVerificationDto,
  ForgetPasswordDto,
  LoginDto,
  RegistrationDto,
  UpdatePasswordDto,
  VerificationCodeSenderDto,
} from '../dto/auth.dto';
import { LoginLog } from '../entities/login-log.entity';
import { JwtService } from './jwt.service';
import { Attendee } from 'src/modules/attendees/entities/attendee.entity';
import { LoggedInUser } from 'src/modules/attendees/data/logged-in-user.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Attendee)
    private readonly attendeeRepository: Repository<Attendee>,
    @InjectRepository(LoginLog)
    private readonly loginLogRepository: Repository<LoginLog>,
    @Inject(JwtService)
    private readonly jwtService: JwtService,
  ) {}

  async login(req: any, loginDto: LoginDto) {
    const user: Attendee = await this.getAUser({
      email: loginDto.email,
    });

    if (!user) {
      throw new HttpException(
        'Invalid Attendee credentials',
        HttpStatus.BAD_REQUEST,
      );
    }
    try {
      const isPasswordValid: boolean = this.jwtService.isPasswordValid(
        loginDto.password,
        user.password,
      );
      if (!isPasswordValid) {
        throw new HttpException(
          'Invalid Attendee credentials',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(
        'Invalid Attendee credentials',
        HttpStatus.BAD_REQUEST,
      );
    }

    // KEEPING LOG
    this.logging(user, req);
    return await this.unifiedAuthResponse(user);
  }

  /**
   * REGISTRATION
   *
   * @param   {RegistrationDto}  registrationDto  [registrationDto description]
   *
   * @return  {[type]}                            [return description]
   */
  async registration(req: any, registrationDto: RegistrationDto) {
    if (registrationDto.password != registrationDto.confirmPassword) {
      throw new HttpException('Password Mismatched', HttpStatus.BAD_REQUEST);
    }
    const previousData = await this.attendeeRepository.findOne({
      where: {
        email: registrationDto.email,
      },
    });

    if (previousData) {
      throw new HttpException('Email already exists', HttpStatus.CONFLICT);
    }

    try {
      let userToRegister: Attendee;

      const salt = await bcrypt.genSaltSync(10);
      const hashedPassword = await bcrypt.hash(registrationDto.password, salt);
      userToRegister = new Attendee();
      userToRegister.name = registrationDto.name;
      userToRegister.email = registrationDto.email;
      userToRegister.password = hashedPassword;

      const registeredUser = await this.attendeeRepository.save(userToRegister);
      // GENERATE A VERIFICATION CODE AND SEND MAIL
      // const verificationCodeSenderDto = new VerificationCodeSenderDto();
      // verificationCodeSenderDto.email = registrationDto.email;
      // await this.generateEmailVerificationCode(verificationCodeSenderDto);

      return await this.unifiedAuthResponse(registeredUser);
    } catch (error) {
      throw new HttpException(
        'An error occurred while registering a user',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * FIRSTLY SEND A VERIFICATION CODE TO THE EMAIL
   *
   * @param   {string}  email  [email description]
   *
   * @return  {[type]}         [return description]
   */
  // async generateEmailVerificationCode(
  //   verificationCodeSenderDto: VerificationCodeSenderDto,
  // ) {
  //   const currentTimestamp = new Date().getTime();
  //   const user = await this.getAUser({
  //     email: verificationCodeSenderDto.email,
  //   });

  //   if (user && !user.isEmailVerified) {
  //     if (user.code && currentTimestamp < user.codeExpiredAt) {
  //       throw new HttpException(
  //         'You can not generate another code before the last one get expired',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //     const code = Math.floor(Math.random() * 900000) + 100000;
  //     const result = await this.emailService.sendEmailVerificationCode(
  //       user,
  //       code,
  //     );

  //     if (result.accepted.length) {
  //       user.code = code.toString();
  //       user.codeExpiredAt = new Date().getTime() + 2 * 60 * 1000;
  //       user.hash = crypto.randomBytes(32).toString('hex');
  //       try {
  //         return await this.attendeeRepository.save(user);
  //       } catch (error) {}
  //       return true;
  //     }

  //     throw new HttpException(
  //       'The email is not sent for some reason',
  //       HttpStatus.BAD_GATEWAY,
  //     );
  //   }

  //   throw new HttpException(
  //     'Non verified user not found',
  //     HttpStatus.BAD_REQUEST,
  //   );
  // }

  /**
   * REFRESHING TOKEN FOR AN EXISTING USER
   */
  public async refreshToken(loggedInUser: LoggedInUser) {
    const user = await this.unifiedAuthResponse(
      await this.getAUser({ id: loggedInUser.id }),
    );
    return user;
  }

  /**
   * THEN VERIFY THE CODE AND ENABLE THE USER FOR USE THIS APPLICATION
   *
   * @param   {ForgetPasswordDto}  forgetPasswordDto  [forgetPasswordDto description]
   *
   * @return  {[type]}                                [return description]
   */
  async emailVerification(emailVerificationDto: EmailVerificationDto) {
    if (!emailVerificationDto.code || !emailVerificationDto.email) {
      throw new HttpException(
        'Please provide both the verification code and email',
        HttpStatus.BAD_REQUEST,
      );
    }

    const currentTimestamp = new Date().getTime();
    const user = await this.getAUser({
      email: emailVerificationDto.email,
      code: emailVerificationDto.code,
    });

    if (user) {
      if (currentTimestamp > user.codeExpiredAt) {
        throw new HttpException(
          'Sorry the time for entering the code is expired',
          HttpStatus.BAD_REQUEST,
        );
      }
      user.isEmailVerified = true;

      await this.attendeeRepository.save(user);
      return await this.unifiedAuthResponse(user);
    }
    throw new HttpException('Invalid code or user', HttpStatus.BAD_REQUEST);
  }

  /**
   * GET A USER
   */
  async getAUser(condition: any) {
    return await this.attendeeRepository.findOne({
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        isEmailVerified: true,
      },
      where: condition,
    });
  }

  /**
   * UNIFIED RESPONSE FOR AUTH
   */
  async unifiedAuthResponse(user: Attendee | any) {
    const token: string = this.jwtService.generateToken(user);
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      token: token,
      isEmailVerified: user.isEmailVerified,
    };
  }

  /**
   * LOGGING AUTHENTICATED USER
   */
  async logging(user: Attendee, requestObject: any) {
    try {
      const loginLog = new LoginLog();
      loginLog.attendee = user;
      loginLog.time = new Date();
      const ip =
        requestObject.headers['x-forwarded-for'] ||
        requestObject.connection.remoteAddress;
      loginLog.ip = ip.split(':').pop();
      await this.loginLogRepository.save(loginLog);
    } catch (error) {
      throw new HttpException(
        'Some error occurred',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * FIRSTLY SEND A VERIFICATION CODE TO THE EMAIL
   *
   * @param   {string}  email  [email description]
   *
   * @return  {[type]}         [return description]
   */
  // async forgetPassword(verificationCodeSenderDto: VerificationCodeSenderDto) {
  //   const currentTimestamp = new Date().getTime();
  //   const user = await this.getAUser({
  //     email: verificationCodeSenderDto.email,
  //   });

  //   if (user) {
  //     if (user.code && currentTimestamp < user.codeExpiredAt) {
  //       throw new HttpException(
  //         'You can not generate another code before the last one get expired',
  //         HttpStatus.BAD_REQUEST,
  //       );
  //     }
  //     const code = Math.floor(Math.random() * 900000) + 100000;
  //     const result = await this.emailService.sendForgetPasswordCode(user, code);

  //     if (result.accepted.length) {
  //       user.code = code.toString();
  //       user.codeExpiredAt = new Date().getTime() + 2 * 60 * 1000;
  //       user.hash = crypto.randomBytes(32).toString('hex');
  //       try {
  //         return await this.attendeeRepository.save(user);
  //       } catch (error) {}
  //       return true;
  //     }

  //     throw new HttpException(
  //       'The email is not sent for some reason',
  //       HttpStatus.BAD_GATEWAY,
  //     );
  //   }

  //   throw new HttpException('Attendee not found', HttpStatus.BAD_REQUEST);
  // }

  /**
   * THEN VERIFY THE CODE AND ENABLE THE PASSWORD RECOVERY OPTION
   *
   * @param   {ForgetPasswordDto}  forgetPasswordDto  [forgetPasswordDto description]
   *
   * @return  {[type]}                                [return description]
   */
  async codeVerification(forgetPasswordDto: ForgetPasswordDto) {
    const currentTimestamp = new Date().getTime();
    const user = await this.attendeeRepository.findOne({
      where: {
        email: forgetPasswordDto.email,
        code: forgetPasswordDto.code,
      },
    });

    if (user) {
      if (currentTimestamp > user.codeExpiredAt) {
        throw new HttpException(
          'Sorry the time for entering the code is expired',
          HttpStatus.BAD_REQUEST,
        );
      }
      return user;
    }
    throw new HttpException('Invalid code or user', HttpStatus.BAD_REQUEST);
  }

  /**
   * RECOVER THE PASSWORD WITH SETTING A NEW ONE
   *
   * @param   {UpdatePasswordDto}  updatePasswordDto  [updatePasswordDto description]
   *
   * @return  {[type]}                                [return description]
   */
  async recoverPassword(updatePasswordDto: UpdatePasswordDto) {
    const user = await this.attendeeRepository.findOne({
      where: {
        hash: updatePasswordDto.hash,
        id: updatePasswordDto.userId,
      },
    });
    if (user) {
      try {
        const newEncodedPassword = this.jwtService.encodePassword(
          updatePasswordDto.newPassword,
        );
        const isPasswordValid: boolean = this.jwtService.isPasswordValid(
          updatePasswordDto.confirmPassword,
          newEncodedPassword,
        );
        if (!isPasswordValid) {
          // IF PASSWORD DOES NOT MATCH
          throw new HttpException(
            'Password Mismatched',
            HttpStatus.BAD_REQUEST,
          );
        }
        user.password = newEncodedPassword;
        await this.attendeeRepository.save(user);
        return true;
      } catch (error) {
        throw new InternalServerErrorException('An error occurred');
      }
    }
    throw new HttpException('Invalid Attendee', HttpStatus.BAD_REQUEST);
  }
}
