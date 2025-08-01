import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { totp } from 'otplib';
import { Prisma, Status } from '@prisma/client';
import { MailService } from 'src/common/mailer/mailer.service';
import { VerifyDto } from './dto/verify-otp.dto';
import { AdminFilterDto } from './dto/admin-filter.dto';
import { LoginDto } from './dto/admin-login.dto';
import { JwtService } from '@nestjs/jwt';
import { config } from 'src/config';
import { Request } from 'express';
import { BcryptEncryption } from 'src/infrastructure/bcrypt';
import { successResponse } from 'src/infrastructure/responseCode/responde';

totp.options = {
  digits: 5,
  step: 300,
};

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async createSuper(createAdminDto: CreateAdminDto) {
    const { email, login, password } = createAdminDto;

    const existEmail = await this.prisma.admin.findFirst({ where: { email } });
    const existLogin = await this.prisma.admin.findFirst({ where: { login } });

    if (existEmail) throw new BadRequestException('Email already exists');
    if (existLogin) throw new BadRequestException('Login already exists');

    const hashedPass = await BcryptEncryption.encrypt(password);

    await this.prisma.admin.create({
      data: {
        ...createAdminDto,
        password: hashedPass,
        role: 'SUPER_ADMIN',
        status: Status.ACTIVE,
      },
    });

    return successResponse({}, 'Super admin created successfully', 201);
  }

  async create(createAdminDto: CreateAdminDto) {
    const { email, login, password } = createAdminDto;

    const existEmail = await this.prisma.admin.findFirst({ where: { email } });
    const existLogin = await this.prisma.admin.findFirst({ where: { login } });

    if (existEmail) throw new BadRequestException('Email already exists');
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

    await this.prisma.admin.create({
      data: {
        ...createAdminDto,
        password: hashedPass,
        role: 'ADMIN',
        status: Status.PENDING,
      },
    });

    return successResponse({}, 'Admin created and OTP sent', 201);
  }

  async verifyOtp(verifyDto: VerifyDto) {
    const { email, otp } = verifyDto;

    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      throw new BadRequestException('Admin not found');
    }
    const isValid = totp.verify({ secret: email, token: otp });

    if (!isValid) {
      throw new BadRequestException('Wrong OTP');
    }

    await this.prisma.admin.update({
      where: { email },
      data: { status: Status.ACTIVE },
    });

    return {
      status_code: 200,
      message: 'OTP verified successfully',
    };
  }

  async sendOtp(email: string) {
    const existEmail = await this.prisma.admin.findFirst({ where: { email } });

    if (!existEmail) throw new BadRequestException('admin not found');

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
    const admin = await this.prisma.admin.findFirst({
      where: { login: loginDto.login },
    });

    if (!admin) throw new BadRequestException('admin not found');
    if (admin.status === Status.PENDING)
      throw new BadRequestException('admin not verified');

    const isMatch = await BcryptEncryption.compare(
      loginDto.password,
      admin.password,
    );
    if (!isMatch) throw new BadRequestException('wrong password');

    const payload = { id: admin.id, role: admin.role };
    const accessToken = await this.jwtService.signAsync(payload);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: config.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });

    const hashedRefreshToken = await BcryptEncryption.encrypt(refreshToken);
    await this.prisma.admin.update({
      where: { id: admin.id },
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

  async findAll(filter: AdminFilterDto) {
    const {
      search,
      status,
      role,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filter;

    const where: Prisma.AdminWhereInput = {
      ...(search && {
        OR: [
          { email: { contains: search, mode: 'insensitive' } },
          { login: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(status && { status }),
      ...(role && { role }),
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.admin.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.admin.count({ where }),
    ]);

    return successResponse(data, 'success', 200, {
      total,
      page,
      limit,
    });
  }

  async findOne(id: string) {
    const data = await this.prisma.admin.findFirst({ where: { id } });
    if (!data) throw new BadRequestException('Admin not found');

    return successResponse(data, 'success', 200);
  }

  async update(id: string, updateAdminDto: UpdateAdminDto, req: Request) {
    const { email, login, oldPassword, newPassword } = updateAdminDto;

    const admin = await this.prisma.admin.findFirst({ where: { id } });
    if (!admin) throw new BadRequestException('Admin not found');

    const requester = req['user'];

    if (admin.id !== requester.id && requester.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Access denied');
    }

    if (email && email !== admin.email) {
      const existEmail = await this.prisma.admin.findFirst({
        where: { email },
      });
      if (existEmail) throw new BadRequestException('Email already exists');
    }

    if (login && login !== admin.login) {
      const existLogin = await this.prisma.admin.findFirst({
        where: { login },
      });
      if (existLogin) throw new BadRequestException('Login already exists');
    }

    let updateData: any = {};
    if (email) updateData.email = email;
    if (login) updateData.login = login;

    if (oldPassword || newPassword) {
      if (!oldPassword || !newPassword) {
        throw new BadRequestException(
          'Both oldPassword and newPassword are required',
        );
      }

      const isMatch = await BcryptEncryption.compare(
        oldPassword,
        admin.password,
      );
      if (!isMatch) throw new ForbiddenException('Old password is incorrect');

      updateData.password = await BcryptEncryption.encrypt(newPassword);
    }

    const updated = await this.prisma.admin.update({
      where: { id },
      data: updateData,
    });

    return successResponse(updated, 'Admin updated', 200);
  }

  async remove(id: string) {
    const admin = await this.prisma.admin.findFirst({ where: { id } });
    if (!admin) throw new BadRequestException('Admin not found');
    await this.prisma.admin.delete({ where: { id } });
    return successResponse({}, 'Admin with id ${id} deleted', 200);
  }

  async refreshToken(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken, {
      secret: config.JWT_REFRESH_SECRET,
    });

    const admin = await this.prisma.admin.findUnique({
      where: { id: payload.id },
    });

    if (!admin) throw new BadRequestException('admin not found');

    const isValid = await BcryptEncryption.compare(
      refreshToken,
      admin.refreshToken || '',
    );
    if (!isValid) throw new ForbiddenException('Invalid refresh token');

    const newAccessToken = await this.jwtService.signAsync({
      id: admin.id,
      role: admin.role,
    });

    const newRefreshToken = await this.jwtService.signAsync(
      { id: admin.id, role: admin.role },
      {
        expiresIn: '7d',
        secret: config.JWT_REFRESH_SECRET,
      },
    );

    await this.prisma.admin.update({
      where: { id: admin.id },
      data: {
        refreshToken: await BcryptEncryption.encrypt(newRefreshToken),
      },
    });

    return successResponse(
      {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      'success',
      200,
    );
  }

  async logout(adminId: string) {
    await this.prisma.admin.update({
      where: { id: adminId },
      data: {
        refreshToken: null,
      },
    });

    return successResponse({}, 'Logged out successfully', 200);
  }
}
