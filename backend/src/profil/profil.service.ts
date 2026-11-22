
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CreateProfilDto } from './dto/create-profil.dto';
import { UpdateProfilDto } from './dto/update-profil.dto';

@Injectable()
export class ProfilService {
  constructor(private prisma: PrismaService) {}

  async create(createProfilDto: CreateProfilDto) {
    const duplicate = await this.prisma.profil.findFirst({
      where: {
        nama: {
          equals: createProfilDto.nama,
          mode: 'insensitive',
        },
      },
    });

    if (duplicate) {
      throw new ConflictException('Nama profil sudah terdaftar');
    }

    return this.prisma.profil.create({
      data: createProfilDto,
    });
  }

  async findAll() {
    return this.prisma.profil.findMany();
  }

  async findOne(id: number) {
    const data = await this.prisma.profil.findUnique({
      where: { id },
    });

    if (!data) {
      throw new NotFoundException('Profil tidak ditemukan');
    }

    return data;
  }

  async update(id: number, updateProfilDto: UpdateProfilDto) {
    await this.findOne(id);

    const namaBaru = updateProfilDto.nama;

    if (namaBaru !== undefined) {
      const duplicate = await this.prisma.profil.findFirst({
        where: {
          nama: {
            equals: namaBaru,
            mode: 'insensitive',
          },
          NOT: { id },
        },
      });

      if (duplicate) {
        throw new ConflictException('Nama profil sudah digunakan');
      }
    }

    return this.prisma.profil.update({
      where: { id },
      data: updateProfilDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.prisma.profil.delete({
      where: { id },
    });
  }
}
