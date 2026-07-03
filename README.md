<p align="center">
  <img src="logo.svg" width="90" height="90" alt="Finza Logo" />
</p>

<h1 align="center">Finza</h1>

<p align="center">
  Plataforma minimalista premium de finanzas personales multimoneda con escáner de tickets por Inteligencia Artificial y sincronización en tiempo real.
</p>

---

## 🚀 Características

*   **Soporte Multimoneda**: Control de saldos en **Bolívares (VES)**, **Dólares (USD)**, **Euros (EUR)** y **USDT (Cripto)**.
*   **Tasas en Tiempo Real**: Sincronización automática de tasas oficiales BCV (Dólar/Euro) y cotización paralela P2P de Binance (USDT).
*   **Escáner de Facturas (IA)**: Integración con **Gemini 2.5 Flash Lite** para extraer automáticamente el total, moneda, comercio y categoría a partir de fotos de tickets de compra.
*   **Diseño Premium**: Interfaz oscura minimallista optimizada con componentes táctiles y comportamiento responsivo fluido.
*   **Seguridad y Sincronización**: Base de datos Postgres en la nube gestionada de forma segura por **Supabase** con autenticación de usuarios y aislamiento de datos por Row Level Security (RLS).

---

## 🛠️ Stack Tecnológico

*   **Frontend**: React, Vite, Tailwind CSS, Material Symbols.
*   **Backend & DB**: Supabase (PostgreSQL), Supabase Auth.
*   **Inteligencia Artificial**: Google Gemini API (modelo `gemini-2.5-flash-lite`).

---

## 📂 Estructura del Proyecto

```text
├── backend/
│   └── supabase/
│       ├── schema.sql           # Definición de tablas y políticas de seguridad (RLS)
│       └── functions/           # Funciones Deno Edge (opcional)
└── frontend/
    ├── src/
    │   ├── components/          # Componentes reutilizables (Teclado, Logo, Cards)
    │   ├── services/            # Servicios de base de datos, tasas y Supabase Auth
    │   ├── views/               # Vistas principales (Dashboard, Formulario, Ajustes)
    │   └── main.jsx
    ├── .env                     # Variables de entorno locales (Excluido de Git)
    └── tailwind.config.js
```

---

## ⚙️ Instalación y Configuración Local

### 1. Clonar el repositorio y entrar al frontend
```bash
git clone https://github.com/Gabriel-Medina12/Finza.git
cd Finza/frontend
```

### 2. Configurar variables de entorno
Crea un archivo llamado `.env` dentro del directorio `frontend/` con las siguientes credenciales:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-de-supabase
VITE_GEMINI_API_KEY=tu-api-key-de-gemini
```

### 3. Instalar dependencias e iniciar el servidor de desarrollo
```bash
npm install
npm run dev
```

---

## 🔒 Seguridad de la Base de Datos (RLS)

Las tablas cuentan con políticas de seguridad que aseguran que **ningún usuario pueda ver o modificar la información de otros**:
*   `accounts`: Los usuarios solo pueden crear, leer y actualizar sus propias cuentas financieras.
*   `transactions`: Aislamiento estricto de movimientos y transferencias por `user_id`.
*   `categories`: Acceso a las categorías globales del sistema y las personalizadas del propio usuario.

---

## ☁️ Despliegue en Producción (Vercel)

1. Sube tu proyecto a un repositorio en **GitHub**.
2. Conéctalo en **Vercel** (`Import Project`).
3. Agrega las variables `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` y `VITE_GEMINI_API_KEY` en la sección de variables de entorno del panel de Vercel.
4. Presiona **Deploy**.
