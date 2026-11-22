import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';

import { ProfilService } from './profil.service';
import { CreateProfilDto } from './dto/create-profil.dto';
import { UpdateProfilDto } from './dto/update-profil.dto';

@Controller('profil')
export class ProfilController {
  constructor(private readonly profilService: ProfilService) {}

  @Post()
  create(@Body() createProfilDto: CreateProfilDto) {
    return this.profilService.create(createProfilDto);
  }

  @Get()
  findAll() {
    return this.profilService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.profilService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfilDto: UpdateProfilDto,
  ) {
    return this.profilService.update(id, updateProfilDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.profilService.remove(id);
  }
}