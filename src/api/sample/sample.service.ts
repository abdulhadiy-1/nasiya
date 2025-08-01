import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateSampleDto } from './dto/create-sample.dto';
import { UpdateSampleDto } from './dto/update-sample.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { AdminRole } from '@prisma/client';
import { SampleFilterDto } from './dto/sample-filter.dto';
import { successResponse } from 'src/infrastructure/responseCode/responde';

@Injectable()
export class SampleService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createSampleDto: CreateSampleDto, userId: string) {
    let sample: any;
    try {
      sample = await this.prisma.sample.create({
        data: { ...createSampleDto, sellerId: userId },
      });
    } catch (error) {
      throw new BadRequestException(`Error on creating Sample ${error}`);
    }
    return successResponse(sample, 'Sample created', 201);
  }
  async findAll(filter: SampleFilterDto) {
    const { search, status, page = 1, limit = 10, sortBy, sortOrder } = filter;
    const sortField = sortBy ?? 'createdAt';
    const direction = sortOrder ?? 'desc';

    const where: any = {};

    if (search) {
      where.text = { contains: search, mode: 'insensitive' };
    }

    if (typeof status === 'boolean') {
      where.status = status;
    }

    const samples = await this.prisma.sample.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortField]: direction,
      },
    });

    const total = await this.prisma.sample.count({ where });

    return successResponse(samples, 'Samples get', 200, {
        total,
        page,
        limit,
      });
  }

  async findOne(id: string) {
    const sample = await this.prisma.sample.findFirst({ where: { id } });
    if (!sample) throw new BadRequestException('Sample not found');
    return successResponse(sample, 'Sample get', 200);
  }

  async update(
    id: string,
    updateSampleDto: UpdateSampleDto,
    user: { id: string; role: AdminRole },
  ) {
    const sample = await this.prisma.sample.findFirst({ where: { id } });
    if (!sample) throw new BadRequestException('Sample not found');
    if (
      sample.sellerId !== user.id &&
      user.role !== 'ADMIN' &&
      user.role !== 'SUPER_ADMIN'
    ) {
      throw new ForbiddenException('Access denied');
    }
    let updated: any;
    try {
      updated = await this.prisma.sample.update({
        where: { id },
        data: updateSampleDto,
      });
    } catch (error) {
      throw new BadRequestException(`Error on updating Sample ${error}`);
    }
    return successResponse(updated, 'Sample updated', 200);
  }

  async remove(id: string, user: { id: string; role: AdminRole }) {
    const sample = await this.prisma.sample.findFirst({ where: { id } });
    if (!sample) throw new BadRequestException('Sample not found');
    if (
      sample.sellerId !== user.id &&
      user.role !== 'ADMIN' &&
      user.role !== 'SUPER_ADMIN'
    ) {
      throw new ForbiddenException('Access denied');
    }

    try {
      await this.prisma.sample.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException(`Error on deleting Sample ${error}`);
    }
    return successResponse({}, 'Sample deleted', 200);
  }
}
