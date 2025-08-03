import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ImgOfDebtorService } from './img-of-debtor.service';
import { CreateImgOfDebtorDto } from './dto/create-img-of-debtor.dto';
import { UpdateImgOfDebtorDto } from './dto/update-img-of-debtor.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';

@Controller('img-of-debtor')
export class ImgOfDebtorController {
  constructor(private readonly imgOfDebtorService: ImgOfDebtorService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createImgOfDebtorDto: CreateImgOfDebtorDto) {
    return this.imgOfDebtorService.create(createImgOfDebtorDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  @ApiQuery({
    name: 'debtorId',
    type: 'string',
    required: false,
  })
  @Get()
  findAll(@Query('debtorId') debtorId?: string) {
    return this.imgOfDebtorService.findAll(debtorId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imgOfDebtorService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateImgOfDebtorDto: UpdateImgOfDebtorDto,
  ) {
    return this.imgOfDebtorService.update(id, updateImgOfDebtorDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imgOfDebtorService.remove(id);
  }
}
