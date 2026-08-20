import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './book-form.component.html'
})
export class BookFormComponent implements OnInit {
  bookForm: FormGroup;
  bookId: number | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private bookService: BookService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.bookForm = this.fb.group({
      title: ['', Validators.required],
      author: ['', Validators.required],
      isbn: ['', [Validators.required, Validators.pattern(/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)/)]],
      cost_usd: [0, [Validators.required, Validators.min(0.01)]],
      stock_quantity: [0, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      supplier_country: ['', [Validators.required, Validators.maxLength(2)]]
    });
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.bookId = Number(idParam);
      this.loadBookData();
    }
  }

  loadBookData() {
    this.loading = true;
    this.bookService.getBook(this.bookId!).subscribe({
      next: (book) => {
        this.bookForm.patchValue(book);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Error al cargar la información del libro.');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  onSubmit() {
    if (this.bookForm.invalid) {
      alert('Por favor, llena todos los campos correctamente.');
      return;
    }
    
    this.loading = true;
    const request = this.bookId 
      ? this.bookService.updateBook(this.bookId, this.bookForm.value)
      : this.bookService.createBook(this.bookForm.value);

    request.subscribe({
      next: () => {
        alert('Libro guardado con éxito');
        this.router.navigate(['/books']);
      },
      error: (err) => {
        alert(`Error al guardar: ${JSON.stringify(err.error)}`);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}