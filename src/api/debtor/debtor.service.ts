import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateDebtorDto } from './dto/create-debtor.dto';
import { UpdateDebtorDto } from './dto/update-debtor.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { successResponse } from 'src/infrastructure/responseCode/responde';
import { DebtorFilterDto } from './dto/debtor-filter.dto';
import { AdminRole } from '@prisma/client';

@Injectable()
export class DebtorService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createDebtorDto: CreateDebtorDto, userId: string) {
    const user = await this.prisma.seller.findFirst({ where: { id: userId } });
    if (!user) throw new BadRequestException('user not found');
    const debtor = await this.prisma.debtor.create({
      data: { ...createDebtorDto, sellerId: userId },
    });

    return successResponse(debtor, 'Debtor created', 201);
  }

  async findAll(filter: DebtorFilterDto) {
    const { search, page = 1, limit = 10, sortBy, sortOrder } = filter;
    const sortField = sortBy ?? 'createdAt';
    const direction = sortOrder ?? 'desc';

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    const debtors = await this.prisma.debtor.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        [sortField]: direction,
      },
      include: {
        Debt: {
          select: {
            amount: true,
          },
        },
        Seller: true,
      },
    });

    const enriched = debtors.map((debtor) => {
      const totalDebt = debtor.Debt.reduce((acc, d) => acc + d.amount, 0);
      return {
        ...debtor,
        totalDebt,
      };
    });

    const total = await this.prisma.debtor.count({ where });

    return successResponse(enriched, 'Debtors retrieved successfully', 200, {
      total,
      page,
      limit,
    });
  }

  async findOne(id: string) {
    const debtor = await this.prisma.debtor.findFirst({
      where: { id },
      include: {
        Debt: true,
        ImgOfDebtor: true,
        Payment: true,
        Phone: true,
        Seller: true,
      },
    });
    if (!debtor) throw new BadRequestException('debtor not found');
    const totalAmount = debtor.Debt.reduce((acc, d) => acc + d.amount, 0);
    return successResponse({...debtor, totalAmount}, 'debtor get', 200);
  }

  async update(
    id: string,
    updateDebtorDto: UpdateDebtorDto,
    user: { id: string; role: AdminRole },
  ) {
    const debtor = await this.prisma.debtor.findFirst({ where: { id } });
    if (!debtor) throw new BadRequestException('debtor not found');
    if (
      debtor.sellerId !== user.id &&
      user.role !== 'ADMIN' &&
      user.role !== 'SUPER_ADMIN'
    ) {
      throw new ForbiddenException('Access denied');
    }
    let updated: any;
    try {
      updated = await this.prisma.debtor.update({
        where: { id },
        data: updateDebtorDto,
      });
    } catch (error) {
      throw new BadRequestException(`Error on updating Debtor ${error}`);
    }
    return successResponse(updated, 'Debtor updated', 200);
  }

  async remove(id: string, user: { id: string; role: AdminRole }) {
    const debtor = await this.prisma.debtor.findFirst({ where: { id } });
    if (!debtor) throw new BadRequestException('Debtor not found');
    if (
      debtor.sellerId !== user.id &&
      user.role !== 'ADMIN' &&
      user.role !== 'SUPER_ADMIN'
    ) {
      throw new ForbiddenException('Access denied');
    }

    try {
      await this.prisma.debtor.delete({ where: { id } });
    } catch (error) {
      throw new BadRequestException(`Error on deleting Debtor ${error}`);
    }
    return successResponse({}, 'Debtor deleted', 200);
  }
}
