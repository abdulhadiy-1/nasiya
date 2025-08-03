import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateImgOfDebtDto } from './dto/create-img-of-debt.dto';
import { UpdateImgOfDebtDto } from './dto/update-img-of-debt.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { successResponse } from 'src/infrastructure/responseCode/responde';

@Injectable()
export class ImgOfDebtService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createImgOfDebtDto: CreateImgOfDebtDto) {
    try {
      const debt = await this.prisma.debt.findFirst({
        where: { id: createImgOfDebtDto.debtId },
      });
      if (!debt) throw new BadRequestException('debt not found');

      const created = await this.prisma.imgOfDebt.create({
        data: createImgOfDebtDto,
      });

      return successResponse(created, 'Image of debt created', 201);
    } catch (error) {
      throw new BadRequestException(`Error creating image of debt: ${error.message}`);
    }
  }

  async findAll(debtId?: string) {
    try {
      const images = await this.prisma.imgOfDebt.findMany({
        where: debtId ? { debtId } : {},
      });

      return successResponse(images, 'images fetched', 200);
    } catch (error) {
      throw new BadRequestException(`Error fetching images: ${error.message}`);
    }
  }

  async findOne(id: string) {
    try {
      const img = await this.prisma.imgOfDebt.findFirst({ where: { id } });
      if (!img) throw new BadRequestException('image not found');

      return successResponse(img, 'one image fetched', 200);
    } catch (error) {
      throw new BadRequestException(`Error fetching image: ${error.message}`);
    }
  }

  async update(id: string, updateImgOfDebtDto: UpdateImgOfDebtDto) {
    try {
      if (updateImgOfDebtDto.debtId) {
        const debt = await this.prisma.debt.findFirst({
          where: { id: updateImgOfDebtDto.debtId },
        });
        if (!debt) throw new BadRequestException('debt not found');
      }

      const img = await this.prisma.imgOfDebt.findFirst({ where: { id } });
      if (!img) throw new BadRequestException('image not found');

      const updated = await this.prisma.imgOfDebt.update({
        where: { id },
        data: updateImgOfDebtDto,
      });

      return successResponse(updated, 'image of debt updated', 200);
    } catch (error) {
      throw new BadRequestException(`Error updating image of debt: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const img = await this.prisma.imgOfDebt.findFirst({ where: { id } });
      if (!img) throw new BadRequestException('image not found');

      await this.prisma.imgOfDebt.delete({ where: { id } });

      return successResponse({}, 'image of debt deleted', 200);
    } catch (error) {
      throw new BadRequestException(`Error deleting image of debt: ${error.message}`);
    }
  }
}
