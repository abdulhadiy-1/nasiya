import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ImgOfDebtService } from './img-of-debt.service';
import { CreateImgOfDebtDto } from './dto/create-img-of-debt.dto';
import { UpdateImgOfDebtDto } from './dto/update-img-of-debt.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';

@Controller('img-of-debt')
export class ImgOfDebtController {
  constructor(private readonly imgOfDebtService: ImgOfDebtService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createImgOfDebtDto: CreateImgOfDebtDto) {
    return this.imgOfDebtService.create(createImgOfDebtDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get()
  @ApiQuery({
    name: 'debtId',
    type: 'string',
    required: false,
  })
  findAll(@Query('debtId') debtId?: string) {
    return this.imgOfDebtService.findAll(debtId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.imgOfDebtService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateImgOfDebtDto: UpdateImgOfDebtDto,
  ) {
    return this.imgOfDebtService.update(id, updateImgOfDebtDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.imgOfDebtService.remove(id);
  }
}
