import requests
from decimal import Decimal
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Book
from .serializers import BookSerializer

class BookViewSet(viewsets.ModelViewSet):
    queryset = Book.objects.all()
    serializer_class = BookSerializer

    @action(detail=False, methods=['get'])
    def search(self, request):
        category = request.query_params.get('category', None)
        if category:
            books = self.queryset.filter(category__icontains=category)
            page = self.paginate_queryset(books)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            serializer = self.get_serializer(books, many=True)
            return Response(serializer.data)
        return Response(
            {"error": "Parámetro 'category' es requerido"}, 
            status=status.HTTP_400_BAD_REQUEST
        )

    @action(detail=False, methods=['get'], url_path='low-stock')
    def low_stock(self, request):
        try:
            threshold = int(request.query_params.get('threshold', 10))
        except ValueError:
            return Response(
                {"error": "Threshold debe ser un número entero"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        books = self.queryset.filter(stock_quantity__lte=threshold)
        page = self.paginate_queryset(books)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(books, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='calculate-price')
    def calculate_price(self, request, pk=None):
        book = self.get_object() 
        
        api_url = "https://api.exchangerate-api.com/v4/latest/USD"
        target_currency = request.data.get('currency', 'EUR') 
        default_rate = Decimal('0.85')
        
        try:
            response = requests.get(api_url, timeout=5)
            response.raise_for_status()
            data = response.json()
            exchange_rate = Decimal(str(data['rates'].get(target_currency, default_rate)))
        except requests.RequestException:
            exchange_rate = default_rate

        cost_local = book.cost_usd * exchange_rate
        margin_percentage = Decimal('40')
        margin_multiplier = Decimal('1') + (margin_percentage / Decimal('100'))
        selling_price_local = cost_local * margin_multiplier

        book.selling_price_local = round(selling_price_local, 2)
        book.save()
        
        result = {
            "book_id": book.id,
            "cost_usd": float(book.cost_usd),
            "exchange_rate": float(exchange_rate),
            "cost_local": float(round(cost_local, 2)),
            "margin_percentage": 40,
            "selling_price_local": float(book.selling_price_local),
            "currency": target_currency,
            "calculation_timestamp": timezone.now().isoformat()
        }
        
        return Response(result, status=status.HTTP_200_OK)