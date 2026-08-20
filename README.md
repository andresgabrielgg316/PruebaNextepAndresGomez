# PruebaNextepAndresGomez

Sistema de gestión de inventario para librerias. Incluye una API REST construida con Django y PostgreSQL, y una Single Page Application (SPA) desarrollada en Angular. Permite administrar libros y calcular precios de venta en tiempo real consumiendo tasas de cambio externas

## Requisitos Previos
* Docker y Docker Compose instalados en el sistema.
* Node.js (v18+) y Angular CLI para ejecutar la interfaz web.

## Instalación y Ejecución

1. Clonar este repositorio en tu máquina local.
2. Levantar los contenedores del backend: `docker-compose up --build -d`
3. Aplicar las migraciones de la base de datos: `docker-compose exec web python manage.py migrate`
4. Navegar al directorio del frontend: `cd bookstore-frontend`
5. Instalar dependencias e iniciar la SPA: `npm install` seguido de `npm start`

## Ejemplos de Uso de Endpoints

* **Listar Libros (GET):** `curl http://localhost:8000/api/books/`
* **Calcular Precio (POST):** `curl -X POST http://localhost:8000/api/books/1/calculate-price/ -H "Content-Type: application/json" -d '{"currency":"VES"}'`

Para más información de los endpoints, revisar el archivo con la coleccion de peticiones 'PruebaAG Coleccion'
