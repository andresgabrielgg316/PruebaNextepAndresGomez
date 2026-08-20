import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {
  private apiUrl = 'http://localhost:8000/api/books/';

  constructor(private http: HttpClient) { }

  getBooks(page: number = 1, category?: string): Observable<any> {
    let params = new HttpParams().set('page', page.toString());
    
    if (category) {
      return this.http.get(`${this.apiUrl}search/`, { params: params.set('category', category) });
    }
    return this.http.get(this.apiUrl, { params });
  }

  getLowStock(threshold: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}low-stock/`, { 
      params: new HttpParams().set('threshold', threshold.toString()) 
    });
  }

  getBook(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}${id}/`);
  }

  createBook(book: any): Observable<any> {
    return this.http.post(this.apiUrl, book);
  }

  updateBook(id: number, book: any): Observable<any> {
    return this.http.put(`${this.apiUrl}${id}/`, book);
  }

  deleteBook(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}${id}/`);
  }

  calculatePrice(id: number, currency: string = 'EUR'): Observable<any> {
    return this.http.post(`${this.apiUrl}${id}/calculate-price/`, { currency });
  }
}