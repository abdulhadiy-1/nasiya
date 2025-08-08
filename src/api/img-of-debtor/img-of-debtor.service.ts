import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateImgOfDebtorDto } from './dto/create-img-of-debtor.dto';
import { UpdateImgOfDebtorDto } from './dto/update-img-of-debtor.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { successResponse } from 'src/infrastructure/responseCode/responde';

@Injectable()
export class ImgOfDebtorService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createImgOfDebtorDto: CreateImgOfDebtorDto) {
    try {
      const debtor = await this.prisma.debtor.findFirst({
        where: { id: createImgOfDebtorDto.debtorId },
      });
      if (!debtor) {
        throw new BadRequestException('Debtor not found');
      }

      if (!createImgOfDebtorDto.paths?.length) {
        throw new BadRequestException('No image paths provided');
      }

      await this.prisma.imgOfDebtor.createMany({
        data: createImgOfDebtorDto.paths.map((name) => ({
          name,
          debtorId: debtor.id,
        })),
      });

      return successResponse({}, 'Image(s) of debtor created', 201);
    } catch (error) {
      throw new BadRequestException(
        `Error creating image of debtor: ${error.message}`,
      );
    }
  }

  async findAll(debtorId?: string) {
    try {
      const images = await this.prisma.imgOfDebtor.findMany({
        where: debtorId ? { debtorId } : {},
      });

      return successResponse(images, 'images of debtor fetched', 200);
    } catch (error) {
      throw new BadRequestException(
        `Error fetching images of debtor: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    try {
      const img = await this.prisma.imgOfDebtor.findFirst({ where: { id } });
      if (!img) throw new BadRequestException('image of debtor not found');

      return successResponse(img, 'one image of debtor fetched', 200);
    } catch (error) {
      throw new BadRequestException(
        `Error fetching image of debtor: ${error.message}`,
      );
    }
  }

  async update(id: string, updateImgOfDebtorDto: UpdateImgOfDebtorDto) {
    try {
      if (updateImgOfDebtorDto.debtorId) {
        const debtor = await this.prisma.debtor.findFirst({
          where: { id: updateImgOfDebtorDto.debtorId },
        });
        if (!debtor) throw new BadRequestException('debtor not found');
      }

      const img = await this.prisma.imgOfDebtor.findFirst({ where: { id } });
      if (!img) throw new BadRequestException('image of debtor not found');

      const updated = await this.prisma.imgOfDebtor.update({
        where: { id },
        data: updateImgOfDebtorDto,
      });

      return successResponse(updated, 'image of debtor updated', 200);
    } catch (error) {
      throw new BadRequestException(
        `Error updating image of debtor: ${error.message}`,
      );
    }
  }

  async remove(id: string) {
    try {
      const img = await this.prisma.imgOfDebtor.findFirst({ where: { id } });
      if (!img) throw new BadRequestException('image of debtor not found');

      await this.prisma.imgOfDebtor.delete({ where: { id } });

      return successResponse({}, 'image of debtor deleted', 200);
    } catch (error) {
      throw new BadRequestException(
        `Error deleting image of debtor: ${error.message}`,
      );
    }
  }
}
