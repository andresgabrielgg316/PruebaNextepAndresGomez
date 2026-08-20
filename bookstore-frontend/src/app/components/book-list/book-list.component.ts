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
  actualCurrency: string = 'USD';
  isFetching = false; 
  calculatingId: number | null = null; 

  constructor(
    private bookService: BookService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { 
    this.loadBooks(); 
  }

  loadBooks(category?: string) {
    this.isFetching = true;
    this.bookService.getBooks(1, category).subscribe({
      next: (res: any) => { 
        this.books = res.results ? res.results : res; 
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
      this.actualCurrency = this.selectedCurrency;
      this.loadBooks(); 
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
}