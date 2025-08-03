import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePhoneOfDebtorDto } from './dto/create-phone-of-debtor.dto';
import { UpdatePhoneOfDebtorDto } from './dto/update-phone-of-debtor.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { successResponse } from 'src/infrastructure/responseCode/responde';

@Injectable()
export class PhoneOfDebtorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPhoneOfDebtorDto: CreatePhoneOfDebtorDto) {
    try {
      const debtor = await this.prisma.debtor.findFirst({
        where: { id: createPhoneOfDebtorDto.debtorId },
      });
      if (!debtor) throw new BadRequestException('debtor not found');

      const created = await this.prisma.phoneOfDebtor.create({
        data: createPhoneOfDebtorDto,
      });

      return successResponse(created, 'phone of debtor created', 201);
    } catch (error) {
      throw new BadRequestException(
        `Error creating phone of debtor: ${error.message}`,
      );
    }
  }

  async findAll(debtorId?: string) {
    try {
      const phones = await this.prisma.phoneOfDebtor.findMany({
        where: debtorId ? { debtorId } : {},
      });

      return successResponse(phones, 'phones of debtor fetched', 200);
    } catch (error) {
      throw new BadRequestException(
        `Error fetching phones of debtor: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const phone = await this.prisma.phoneOfDebtor.findFirst({ where: { id } });
      if (!phone) throw new BadRequestException('phone of debtor not found');

      return successResponse(phone, 'one phone of debtor fetched', 200);
    } catch (error) {
      throw new BadRequestException(
        `Error fetching phone of debtor: ${error.message}`,
      );
    }
  }

  async update(id: string, updatePhoneOfDebtorDto: UpdatePhoneOfDebtorDto) {
    try {
      if (updatePhoneOfDebtorDto.debtorId) {
        const debtor = await this.prisma.debtor.findFirst({
          where: { id: updatePhoneOfDebtorDto.debtorId },
        });
        if (!debtor) throw new BadRequestException('debtor not found');
      }

      const phone = await this.prisma.phoneOfDebtor.findFirst({ where: { id } });
      if (!phone) throw new BadRequestException('phone of debtor not found');

      const updated = await this.prisma.phoneOfDebtor.update({
        where: { id },
        data: updatePhoneOfDebtorDto,
      });

      return successResponse(updated, 'phone of debtor updated', 200);
    } catch (error) {
      throw new BadRequestException(
        `Error updating phone of debtor: ${error.message}`,
      );
    }
  }

  async remove(id: string) {
    try {
      const phone = await this.prisma.phoneOfDebtor.findFirst({ where: { id } });
      if (!phone) throw new BadRequestException('phone of debtor not found');

      await this.prisma.phoneOfDebtor.delete({ where: { id } });

      return successResponse({}, 'phone of debtor deleted', 200);
    } catch (error) {
      throw new BadRequestException(
        `Error deleting phone of debtor: ${error.message}`,
      );
    }
  }
}
