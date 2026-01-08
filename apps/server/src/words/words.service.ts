import { Injectable } from '@nestjs/common';
import { CreateWordDto } from './dto/create-word.dto';
import { UpdateWordDto } from './dto/update-word.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WordsService {
  constructor(private prisma: PrismaService) { }

  async create(createWordDto: CreateWordDto) {
    // For now, use a default user since we don't have auth yet
    let user = await this.prisma.user.findFirst();
    if (!user) {
      user = await this.prisma.user.create({
        data: { email: 'default@local.com' }
      });
    }

    const sanitizedText = createWordDto.text
      .replace(/[.,"'()<>/\\;{}[\]=+&]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return this.prisma.word.create({
      data: {
        text: sanitizedText,
        definition: createWordDto.definition,
        context: createWordDto.context,
        userId: user.id,
      },
    });
  }

  findAll() {
    return this.prisma.word.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.word.findUnique({
      where: { id }
    });
  }

  update(id: string, updateWordDto: UpdateWordDto) {
    return this.prisma.word.update({
      where: { id },
      data: updateWordDto,
    });
  }

  remove(id: string) {
    return this.prisma.word.delete({
      where: { id },
    });
  }
}
