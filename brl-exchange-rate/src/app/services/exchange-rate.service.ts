import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface CurrentExchangeRate {
  exchangeRate: number;
  fromSymbol: string;
  toSymbol: string;
  lastUpdatedAt?: string;
  rateLimitExceeded?: boolean;
  success?: boolean;
  rate?: number;
  timestamp?: number;
}

export interface DailyExchangeRateResponse {
  data: DailyExchangeRate[];
  from: string;
  to: string;
  lastUpdatedAt?: string;
  rateLimitExceeded?: boolean;
  success?: boolean;
}

export interface DailyExchangeRate {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  closeDiff?: number;
}

export interface HistoricalExchangeRate {
  fromSymbol: string;
  toSymbol: string;
  rates: DailyExchangeRate[];
}

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {
  private readonly apiUrl = 'https://api-brl-exchange.actionlabs.com.br/api/1.0/open';
  private readonly apiKey = 'RVZG0GHEV2KORLNA';

  constructor(private http: HttpClient) { }

  getCurrentExchangeRate(currencyCode: string): Observable<CurrentExchangeRate> {
    const params = new HttpParams()
      .set('apiKey', this.apiKey)
      .set('from_symbol', currencyCode.toUpperCase())
      .set('to_symbol', 'BRL');

    return this.http.get<CurrentExchangeRate>(`${this.apiUrl}/currentExchangeRate`, { params });
  }

  getHistoricalExchangeRate(currencyCode: string, days: number = 30): Observable<DailyExchangeRateResponse> {
    const params = new HttpParams()
      .set('apiKey', this.apiKey)
      .set('from_symbol', currencyCode.toUpperCase())
      .set('to_symbol', 'BRL');

    const url = `${this.apiUrl}/dailyExchangeRate`;

    return this.http.get<DailyExchangeRateResponse>(url, { params }).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
}
