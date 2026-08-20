import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './book-list.component.html'
})
export class BookListComponent implements OnInit {
  books: any[] = [];
  calcResult: any = null;
  selectedCurrency: string = 'EUR';
  isFetching = false; 
  calculatingId: number | null = null; 

  currentPage = 1;
  hasNext = false;
  hasPrev = false;

  constructor(
    private bookService: BookService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { 
    this.loadBooks(); 
  }

loadBooks(category?: string, page: number = 1) {
  this.isFetching = true;
  this.bookService.getBooks(page, category).subscribe({
    next: (res: any) => { 
      const bookList = res.results ? res.results : res; 
    
      const savedCurrencies = JSON.parse(localStorage.getItem('book_currencies') || '{}');
      
      this.books = bookList.map((book: any) => ({
        ...book,
        calculated_currency: savedCurrencies[book.id] || null
      }));

      this.hasNext = res.next !== null;
      this.hasPrev = res.previous !== null;
      this.currentPage = page;
      
      this.isFetching = false;
      this.cdr.detectChanges(); 
    },
    error: (err) => { 
      console.error(err);
      alert('Error cargando el inventario'); 
      this.isFetching = false;
      this.cdr.detectChanges();
    }
  });
}

  loadLowStock() {
    this.isFetching = true;
    this.bookService.getLowStock(10).subscribe({
      next: (res: any) => { 
        this.books = res.results ? res.results : res; 
        this.isFetching = false;
        this.cdr.detectChanges(); 
      },
      error: () => {
        alert('Error cargando stock bajo');
        this.isFetching = false;
        this.cdr.detectChanges();
      }
    });
  }

calculatePrice(id: number) {
  this.calculatingId = id;
  this.calcResult = null;
  
  this.bookService.calculatePrice(id, this.selectedCurrency).subscribe({
    next: (res) => { 
      this.calcResult = res; 
      this.calculatingId = null;

      const bookIndex = this.books.findIndex(b => b.id === id);
      if (bookIndex !== -1) {
        this.books[bookIndex].selling_price_local = res.selling_price_local;
        this.books[bookIndex].calculated_currency = res.currency;

        const savedCurrencies = JSON.parse(localStorage.getItem('book_currencies') || '{}');
        savedCurrencies[id] = res.currency;
        localStorage.setItem('book_currencies', JSON.stringify(savedCurrencies));
      }

      this.cdr.detectChanges(); 
    },
    error: (err) => {
      alert(`Error en el cálculo: ${err.status}`);
      this.calculatingId = null;
      this.cdr.detectChanges();
    }
  });
}

  deleteBook(id: number) {
    if (confirm('Estas seguro de eliminar este libro?')) {
      this.isFetching = true;
      this.bookService.deleteBook(id).subscribe({
        next: () => this.loadBooks(),
        error: () => {
          alert('Error al eliminar');
          this.isFetching = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  nextPage() {
    if (this.hasNext) this.loadBooks(undefined, this.currentPage + 1);
  }

  prevPage() {
    if (this.hasPrev) this.loadBooks(undefined, this.currentPage - 1);
  }
}