import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Country } from '../country/country.entity';
import { CurrencySyncService } from './currency-sync.service';
import { CurrencySyncController } from './currency-sync.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Country]),
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [CurrencySyncController],
  providers: [CurrencySyncService],
  exports: [CurrencySyncService],
})
export class CurrencyModule {}