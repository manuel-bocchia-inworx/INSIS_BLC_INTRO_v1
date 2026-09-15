# Capacitación BLC — INSIS Billing and Collection

Curso interno autocontenido en formato web estática. No requiere build, servidor de aplicaciones ni dependencias externas.

## Contenido

```
capacitacion-BLC/
├── index.html
├── assets/
│   ├── css/styles.css
│   └── js/
│       ├── data.js     (banco de preguntas + glosario)
│       └── app.js      (navegación, progreso, examen)
└── README.md
```

## Cómo usar

- **Local:** abrir `index.html` con doble clic en cualquier navegador moderno.
- **Servidor:** copiar la carpeta completa a un directorio público (IIS, Apache, Nginx, S3, SharePoint, GitHub Pages).
- **Distribución:** comprimir la carpeta `capacitacion-BLC` en un `.zip` y enviarla.

## Progreso del alumno

El avance y el resultado del examen se guardan en `localStorage` del navegador del usuario. No hay backend ni envío de datos.

Para reiniciar el curso: botón **Reiniciar progreso** en la barra lateral.

## Fuentes del contenido

| Fuente | Uso |
|---|---|
| `BLC_reconstruccion_capacitacion.md` | Contenido funcional completo del curso |
| `Billing_and_Collection_Data_Model.pdf` (250 pág., Oracle Data Modeler, 29/04/2026) | Estructura de tablas, columnas, constraints y FKs |
| `transcription.txt` | Ejemplo funcional demostrado en la capacitación |
| `agent-bundle` (INSIS Oracle Agent) | Reglas de consulta read-only y convenciones de schema |
