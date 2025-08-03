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
import { PhoneOfDebtorService } from './phone-of-debtor.service';
import { CreatePhoneOfDebtorDto } from './dto/create-phone-of-debtor.dto';
import { UpdatePhoneOfDebtorDto } from './dto/update-phone-of-debtor.dto';
import { ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from 'src/common/guard/auth.guard';

@Controller('phone-of-debtor')
export class PhoneOfDebtorController {
  constructor(private readonly phoneOfDebtorService: PhoneOfDebtorService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPhoneOfDebtorDto: CreatePhoneOfDebtorDto) {
    return this.phoneOfDebtorService.create(createPhoneOfDebtorDto);
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
    return this.phoneOfDebtorService.findAll(debtorId);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.phoneOfDebtorService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePhoneOfDebtorDto: UpdatePhoneOfDebtorDto,
  ) {
    return this.phoneOfDebtorService.update(id, updatePhoneOfDebtorDto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.phoneOfDebtorService.remove(id);
  }
}
