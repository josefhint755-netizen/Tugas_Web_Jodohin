
import { Module } from '@nestjs/common';
import { ProfilModule } from './profil/profil.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, ProfilModule],
})
export class AppModule {}
