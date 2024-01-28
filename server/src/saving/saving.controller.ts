import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SavingService } from './saving.service';
import { CreateSavingDto, EditSavingDto } from './dto';
import { GetUser } from '../auth/decorator/get-user.decorator';
import { JwtGuard } from '../auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('saving')
export class SavingController {
  constructor(private saving: SavingService) {}

  @Post()
  createSaving(@GetUser('id') uid: number, @Body() dto: CreateSavingDto) {
    return this.saving.createSaving(uid, dto);
  }

  @Get()
  getSavings(@GetUser('id') uid: number) {
    return this.saving.getSavings(uid);
  }

  @Get(':id')
  getSavingById(
    @GetUser('id') uid: number,
    @Param('id', ParseIntPipe) savingId: number,
  ) {
    return this.saving.getSavingById(uid, savingId);
  }

  @Patch(':id')
  editSavingById(
    @GetUser('id') uid: number,
    @Body() dto: EditSavingDto,
    @Param('id', ParseIntPipe) savingId: number,
  ) {
    return this.saving.editSavingById(uid, dto, savingId);
  }

  @Delete(':id')
  deleteSavingById(
    @GetUser('id') uid: number,
    @Param('id', ParseIntPipe) savingId: number,
  ) {
    return this.saving.deleteSavingById(uid, savingId);
  }
}
