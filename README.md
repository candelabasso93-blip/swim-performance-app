# Swim Club Performance App

Plataforma de seguimiento de rendimiento para nadadores y coaches.

## Cómo ver la app en funcionamiento (vista previa local)

### 1) Instalar dependencias
```bash
npm install
```

### 2) Levantar el entorno de desarrollo
```bash
npm run dev
```

Vite mostrará una URL en consola (normalmente `http://localhost:5173`).
Abre esa URL en tu navegador para usar la app.

---

## Opcional: probar build de producción local

### 1) Generar build
```bash
npm run build
```

### 2) Levantar preview del build
```bash
npm run preview
```

Abre la URL que se muestre en consola (normalmente `http://localhost:4173`).

---

## Usarla fácil desde un teléfono (sin instalar nada)

La app ya es web, así que para abrirla en un celular sin instalar apps debes **publicarla online** y usar un link.

### Opción recomendada (Vercel) — 5 minutos

1. Sube este proyecto a GitHub.
2. Crea una cuenta en [vercel.com](https://vercel.com).
3. Pulsa **Add New Project** y conecta tu repositorio.
4. Vercel detecta Vite automáticamente.
5. Confirma deploy con estos valores:
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Al terminar, Vercel te da una URL pública (por ejemplo `https://tu-app.vercel.app`).
7. Abre ese link desde cualquier teléfono y listo.

### Opción alternativa (Netlify)

1. Sube el repo a GitHub.
2. En [netlify.com](https://netlify.com) crea un sitio desde Git.
3. Configura:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Publica y usa la URL generada desde el móvil.

## Importante para datos

Esta app guarda datos en `localStorage` del navegador.
Eso significa:
- Cada celular/computadora tiene su propia data local.
- Si borras datos del navegador, se pierden.

Si quieres que todos vean los mismos datos del club en cualquier teléfono, el siguiente paso es agregar backend (API + base de datos).
