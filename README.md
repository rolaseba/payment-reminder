# SeguiPagos - Sistema de Recordatorio de Pagos

Una aplicación completa para gestionar recordatorios de servicios y pagos de manera eficiente.

## Características

- ✅ **Gestión de Servicios**: Agregar, editar y eliminar recordatorios de pago
- 📅 **Vencimientos Periódicos**: Configura el día del mes en que vence cada servicio
- 🏷️ **Categorías Personalizables**: Organiza tus servicios por categorías con colores
- 💰 **Registro de Pagos**: Marca los pagos realizados y mantén un historial
- 📊 **Dashboard**: Visualiza próximos vencimientos y estadísticas del mes
- 🎨 **Interfaz Premium**: Diseño moderno con glassmorphism y modo oscuro

## Tecnologías

- **Backend**: Node.js + Express
- **Base de Datos**: SQLite3
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Estilos**: CSS personalizado con efectos glassmorphism

## Instalación

1. **Instalar dependencias**:
```bash
npm install
```

2. **Iniciar el servidor**:
```bash
node server.js
```

3. **Abrir en el navegador**:
```
http://localhost:3000
```

## Uso

### Agregar un Servicio

1. Haz clic en el botón **"Nuevo Servicio"**
2. Completa el formulario:
   - **Nombre del Servicio**: Ej. "Edesur", "Netflix"
   - **Categoría**: Selecciona una existente o crea una nueva
   - **Día de Vencimiento**: El día del mes en que vence (1-31)
   - **Monto Aproximado**: Opcional, para estadísticas
3. Haz clic en **"Guardar"**

### Crear una Categoría

1. Al agregar un servicio, haz clic en el botón **+** junto al selector de categoría
2. Ingresa el nombre y selecciona un color
3. Haz clic en **"Crear"**

### Registrar un Pago

1. En la sección **"Próximos Vencimientos"**, localiza el servicio
2. Haz clic en el ícono de **check** (✓)
3. Confirma el monto pagado
4. Haz clic en **"Confirmar Pago"**

El pago quedará registrado en el historial y se actualizarán las estadísticas.

### Eliminar un Servicio

1. En la tabla **"Mis Servicios"**, localiza el servicio
2. Haz clic en el ícono de **basura** (🗑️)
3. Confirma la eliminación

## Estructura del Proyecto

```
payment-reminder/
├── server.js           # Servidor Express y API REST
├── payments.db         # Base de datos SQLite (se crea automáticamente)
├── public/
│   ├── index.html      # Página principal
│   ├── css/
│   │   └── style.css   # Estilos de la aplicación
│   └── js/
│       └── app.js      # Lógica del frontend
├── package.json
└── README.md
```

## API Endpoints

### Categorías
- `GET /api/categories` - Obtener todas las categorías
- `POST /api/categories` - Crear una categoría

### Recordatorios
- `GET /api/reminders` - Obtener todos los recordatorios
- `POST /api/reminders` - Crear un recordatorio
- `PUT /api/reminders/:id` - Actualizar un recordatorio
- `DELETE /api/reminders/:id` - Eliminar un recordatorio

### Pagos
- `GET /api/payments` - Obtener historial de pagos
- `POST /api/payments` - Registrar un pago
- `GET /api/payments/check?month=X&year=Y` - Verificar pagos de un período

## Notas Importantes

- Los vencimientos son **periódicos mensuales**. Si configuras el día 10, el servicio vencerá el día 10 de cada mes.
- Si hoy es después del día de vencimiento, el sistema mostrará el próximo vencimiento del mes siguiente.
- Los pagos se registran por período (mes/año), permitiendo un historial completo.
- La base de datos se crea automáticamente con categorías predeterminadas: Energía, Gas, Internet, Agua.

## Solución de Problemas

### El servidor no inicia
- Verifica que el puerto 3000 esté disponible
- Asegúrate de haber ejecutado `npm install`

### No veo la interfaz, solo JSON
- Asegúrate de acceder a `http://localhost:3000` (sin `/api/...`)
- Verifica que los archivos en `public/` existan

### Los cambios no se reflejan
- Recarga la página con Ctrl+F5 (hard refresh)
- Verifica la consola del navegador para errores JavaScript

## Licencia

ISC
