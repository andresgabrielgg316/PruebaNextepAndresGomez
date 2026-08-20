from rest_framework import serializers
from .models import Book

class BookSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = '__all__'

    def validate_isbn(self, value):
        clean_isbn = value.replace('-', '')
        
        if len(clean_isbn) not in [10, 13]:
            raise serializers.ValidationError("El ISBN debe contener exactamente 10 o 13 dígitos")
        
        if not clean_isbn[:-1].isdigit() or clean_isbn[-1] not in '0123456789X':
            raise serializers.ValidationError("El formato del ISBN no es valido")

        return value