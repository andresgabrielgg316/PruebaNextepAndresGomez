from django.db import models

# Create your models here.
from django.core.validators import MinValueValidator, RegexValidator

class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    
    isbn = models.CharField(
        max_length=17, 
        unique=True,
        validators=[
            RegexValidator(
                regex=r'^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)',
                message="El ISBN debe contener 10 o 13 digitos validos"
            )
        ]
    )
    
    cost_usd = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(0.01)]
    )
    
    selling_price_local = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True
    )
    
    stock_quantity = models.IntegerField(
        validators=[MinValueValidator(0)]
    )
    
    category = models.CharField(max_length=100)
    supplier_country = models.CharField(max_length=2)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.isbn})"