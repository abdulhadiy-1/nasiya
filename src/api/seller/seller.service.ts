import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { totp } from 'otplib';
import { JwtService } from '@nestjs/jwt';
import { MailService } from 'src/common/mailer/mailer.service';
import { SellerFilterDto } from './dto/seller-filter.dto';
import { LoginDto } from '../admin/dto/admin-login.dto';
import { Status } from '@prisma/client';
import { config } from 'src/config';
import { VerifyDto } from '../admin/dto/verify-otp.dto';
import { Request } from 'express';
import { BcryptEncryption } from 'src/infrastructure/bcrypt';
import { successResponse } from 'src/infrastructure/responseCode/responde';

totp.options = {
  digits: 5,
  step: 300,
};

@Injectable()
export class SellerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async create(createSellerDto: CreateSellerDto) {
    const { email, login, phoneNumber, password } = createSellerDto;

    const existEmail = await this.prisma.seller.findFirst({ where: { email } });
    const existLogin = await this.prisma.seller.findFirst({ where: { login } });
    const existPhone = await this.prisma.seller.findFirst({
      where: { phoneNumber },
    });
    if (existEmail) throw new BadRequestException('Email already exists');
    if (existPhone)
      throw new BadRequestException('Phone number already exists');
    if (existLogin) throw new BadRequestException('Login already exists');

    const otp = totp.generate(email);
    try {
      await this.mailService.sendMail(
        email,
        'Your One-Time Password',
        `Your OTP is: ${otp}`,
      );
    } catch (error) {
      throw new BadRequestException(`Failed to send OTP: ${error.message}`);
    }
    const hashedPass = await BcryptEncryption.encrypt(password);

    await this.prisma.seller.create({
      data: {
        ...createSellerDto,
        password: hashedPass,
      },
    });

    return successResponse({}, 'Seller created and OTP sent', 201);
  }

  async sendOtp(email: string) {
    const existEmail = await this.prisma.seller.findFirst({ where: { email } });

    if (!existEmail) throw new BadRequestException('seller not found');

    const otp = totp.generate(email);

    try {
      await this.mailService.sendMail(
        email,
        'Your One-Time Password',
        `Your OTP is: ${otp}`,
      );
    } catch (error) {
      throw new BadRequestException(`Failed to send OTP: ${error.message}`);
    }
    return successResponse({}, 'OTP sent', 200);
  }

  async login(loginDto: LoginDto) {
    const seller = await this.prisma.seller.findFirst({
      where: { login: loginDto.login },
    });

    if (!seller) throw new BadRequestException('seller not found');
    if (seller.status === Status.PENDING)
      throw new BadRequestException('seller not verified');

    const isMatch = await BcryptEncryption.compare(
      loginDto.password,
      seller.password,
    );
    if (!isMatch) throw new BadRequestException('wrong password');

    const payload = { id: seller.id };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: config.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    const hashedRefreshToken = await BcryptEncryption.encrypt(refreshToken);
    await this.prisma.seller.update({
      where: { id: seller.id },
      data: { refreshToken: hashedRefreshToken },
    });

    return successResponse(
      {
        accessToken,
        refreshToken,
      },
      'login successful',
      200,
    );
  }

  async refreshToken(refreshToken: string) {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: config.JWT_REFRESH_SECRET,
      });
    } catch (err) {
      throw new ForbiddenException('Invalid or expired refresh token');
    }

    const seller = await this.prisma.seller.findUnique({
      where: { id: payload.id },
    });

    if (!seller) throw new BadRequestException('seller not found');

    const isValid = await BcryptEncryption.compare(
      refreshToken,
      seller.refreshToken || '',
    );
    if (!isValid) throw new ForbiddenException('Invalid refresh token');

    const newAccessToken = await this.jwtService.signAsync({
      id: seller.id,
    });

    const newRefreshToken = await this.jwtService.signAsync(
      { id: seller.id },
      {
        expiresIn: '7d',
        secret: config.JWT_REFRESH_SECRET,
      },
    );

    await this.prisma.seller.update({
      where: { id: seller.id },
      data: {
        refreshToken: await BcryptEncryption.encrypt(newRefreshToken),
      },
    });

    return successResponse(
      {
        newAccessToken,
        newRefreshToken,
      },
      'success',
      200,
    );
  }

  async verifyOtp(verifyDto: VerifyDto) {
    const { email, otp } = verifyDto;

    const seller = await this.prisma.seller.findUnique({ where: { email } });
    if (!seller) {
      throw new BadRequestException('seller not found');
    }
    const isValid = totp.verify({ secret: email, token: otp });
    if (!isValid) {
      throw new BadRequestException('Wrong OTP');
    }

    await this.prisma.seller.update({
      where: { email },
      data: { status: Status.ACTIVE },
    });

    return successResponse({}, 'OTP verified successfully', 200);
  }

  async findAll(filterDto: SellerFilterDto) {
    const {
      search,
      phoneNumber,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filterDto;

    const where: any = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { login: { contains: search, mode: 'insensitive' } },
        { phoneNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (phoneNumber) {
      where.phoneNumber = phoneNumber;
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.seller.findMany({
        where,
        orderBy: {
          [sortBy]: sortOrder,
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.seller.count({ where }),
    ]);

    return successResponse(data, 'Sellers fetched successfully', 200, {
      total,
      page,
      limit,
    });
  }

  async findOne(id: string) {
    const data = await this.prisma.seller.findFirst({ where: { id } });

    if (!data) throw new BadRequestException('Seller not found');

    return successResponse(data, 'success', 200);
  }

  async update(id: string, updateSellerDto: UpdateSellerDto, req: Request) {
    const seller = await this.prisma.seller.findFirst({ where: { id } });
    if (!seller) throw new BadRequestException('Seller not found');

    const { email, login, phoneNumber, oldPassword, newPassword, ...rest } =
      updateSellerDto;

    const requester = req['user'];
    if (
      seller.id !== requester.id &&
      requester.role !== 'ADMIN' &&
      requester.role !== 'SUPER_ADMIN'
    ) {
      throw new ForbiddenException('Access denied');
    }

    if (email && email !== seller.email) {
      const existEmail = await this.prisma.seller.findFirst({
        where: { email },
      });
      if (existEmail) throw new BadRequestException('Email already exists');
    }

    if (login && login !== seller.login) {
      const existLogin = await this.prisma.seller.findFirst({
        where: { login },
      });
      if (existLogin) throw new BadRequestException('Login already exists');
    }

    if (phoneNumber && phoneNumber !== seller.phoneNumber) {
      const existPhoneNumber = await this.prisma.seller.findFirst({
        where: { phoneNumber },
      });
      if (existPhoneNumber)
        throw new BadRequestException('Phone number already exists');
    }

    const updateData: any = { ...rest };
    if (email) updateData.email = email;
    if (login) updateData.login = login;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    if (oldPassword || newPassword) {
      if (!oldPassword || !newPassword) {
        throw new BadRequestException(
          'Both oldPassword and newPassword are required',
        );
      }

      const isMatch = await BcryptEncryption.compare(
        oldPassword,
        seller.password,
      );
      if (!isMatch) throw new ForbiddenException('Old password is incorrect');

      updateData.password = await BcryptEncryption.encrypt(newPassword);
    }

    const updated = await this.prisma.seller.update({
      where: { id },
      data: updateData,
    });

    return successResponse(updated, 'Seller updated successfully', 200);
  }

  async remove(id: string) {
    const seller = await this.prisma.seller.findFirst({ where: { id } });
    if (!seller) throw new BadRequestException('Seller not found');
    await this.prisma.seller.delete({ where: { id } });
    return successResponse({}, `Seller with id ${id} deleted`, 200);
  }

  async logout(sellerId: string) {
    await this.prisma.seller.update({
      where: { id: sellerId },
      data: {
        refreshToken: null,
      },
    });

    return successResponse({}, `Logged out successfully`, 200);

  }
}
