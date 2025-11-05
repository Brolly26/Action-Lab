import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ExchangeRateService, CurrentExchangeRate, DailyExchangeRate, HistoricalExchangeRate } from './services/exchange-rate.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  currencyCode: string = '';
  currentRate: CurrentExchangeRate | null = null;
  historicalRates: DailyExchangeRate[] = [];
  loading: boolean = false;
  error: string | null = null;
  showHistory: boolean = false;

  constructor(private exchangeRateService: ExchangeRateService) {}

  searchCurrency() {
    if (!this.currencyCode || this.currencyCode.trim().length === 0) {
      this.error = 'Por favor, digite um código de moeda (ex: USD, EUR, GBP)';
      return;
    }

    this.loading = true;
    this.error = null;
    this.currentRate = null;
    this.historicalRates = [];
    this.showHistory = false;

    this.exchangeRateService.getCurrentExchangeRate(this.currencyCode.trim().toUpperCase()).subscribe({
      next: (data: CurrentExchangeRate) => {
        if (data.rateLimitExceeded) {
          this.error = 'Limite de requisições excedido. Por favor, aguarde alguns minutos e tente novamente.';
          this.loading = false;
          return;
        }

        if (!data.success) {
          this.error = 'Erro ao buscar taxa de câmbio. Tente novamente.';
          this.loading = false;
          return;
        }

        this.currentRate = {
          exchangeRate: data.exchangeRate || 0,
          fromSymbol: data.fromSymbol || 'BRL',
          toSymbol: data.toSymbol || this.currencyCode.trim().toUpperCase(),
          lastUpdatedAt: data.lastUpdatedAt,
          rateLimitExceeded: data.rateLimitExceeded,
          success: data.success,
          rate: data.exchangeRate || 0,
          timestamp: data.lastUpdatedAt ? new Date(data.lastUpdatedAt).getTime() : undefined
        };
        this.loading = false;
      },
      error: (err) => {
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.status === 429) {
          this.error = 'Limite de requisições excedido. Por favor, aguarde alguns minutos e tente novamente.';
        } else if (err.status === 404) {
          this.error = 'Moeda não encontrada. Verifique o código da moeda e tente novamente.';
        } else {
          this.error = 'Erro ao buscar taxa de câmbio. Verifique o código da moeda e tente novamente.';
        }
        this.loading = false;
      }
    });
  }

  loadHistory() {
    if (!this.currencyCode || !this.currentRate) {
      return;
    }

    if (this.showHistory) {
      this.showHistory = false;
      return;
    }

    if (this.historicalRates.length > 0) {
      this.showHistory = true;
      return;
    }

    this.loading = true;
    this.error = null;

    this.exchangeRateService.getHistoricalExchangeRate(this.currencyCode.trim().toUpperCase(), 30).subscribe({
      next: (data: any) => {
        if (data.rateLimitExceeded) {
          this.error = 'Limite de requisições excedido. Por favor, aguarde alguns minutos e tente novamente.';
          this.loading = false;
          return;
        }

        if (!data.success) {
          this.error = 'Erro ao buscar histórico de taxas. Tente novamente.';
          this.loading = false;
          return;
        }

        let rates: DailyExchangeRate[] = [];
        
        if (data.data && Array.isArray(data.data)) {
          rates = data.data;
        } else if (Array.isArray(data)) {
          rates = data;
        }

        const normalizedRates: DailyExchangeRate[] = rates.map((rate: any) => ({
          date: rate.date || '',
          open: rate.open || 0,
          high: rate.high || 0,
          low: rate.low || 0,
          close: rate.close || 0
        }));

        normalizedRates.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          return dateA - dateB;
        });

        this.historicalRates = normalizedRates.map((rate: DailyExchangeRate, index: number) => {
          if (index > 0) {
            const previousClose = normalizedRates[index - 1].close;
            rate.closeDiff = rate.close - previousClose;
          } else {
            rate.closeDiff = 0;
          }
          return rate;
        });
        if (normalizedRates.length === 0) {
          this.error = 'Nenhum dado histórico encontrado para esta moeda.';
          this.loading = false;
          return;
        }

        this.showHistory = true;
        this.loading = false;
      },
      error: (err) => {
        if (err.error?.message) {
          this.error = err.error.message;
        } else if (err.status === 429) {
          this.error = 'Limite de requisições excedido. Por favor, aguarde alguns minutos e tente novamente.';
        } else if (err.status === 404) {
          this.error = 'Endpoint de histórico não encontrado. Verifique a URL da API.';
        } else if (err.status === 0) {
          this.error = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else {
          this.error = `Erro ao buscar histórico de taxas (${err.status || 'Erro desconhecido'}). Tente novamente mais tarde.`;
        }
        this.loading = false;
      }
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  formatDateTime(): string {
    const now = new Date();
    const date = now.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const time = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return `${date} - ${time}`;
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  formatNumber(value: number): string {
    return value.toFixed(4).replace('.', ',');
  }

  formatCloseDiff(value: number): string {
    if (value === 0) return '0.0000';
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(4)}`;
  }

  formatCloseDiffPercent(value: number, close: number): string {
    if (value === 0) return '0.00%';
    const percent = (value / close) * 100;
    const sign = percent > 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  }
}
