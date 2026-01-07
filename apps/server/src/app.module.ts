import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OllamaModule } from './ollama/ollama.module';
import { WordsModule } from './words/words.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [OllamaModule, WordsModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
