# MarisqueriaClick App

## Cómo Subir Cambios Nuevos (La forma más común)

Después de la configuración inicial, solo necesitarás estos tres comandos para actualizar tu aplicación con los nuevos cambios.

**Paso 1: Prepara todos los archivos modificados**
```bash
git add .
```

**Paso 2: Guarda los cambios con un mensaje descriptivo**
```bash
git commit -m "Un mensaje que describa tus cambios, ej: Se agregó el menú de postres"
```

**Paso 3: Sube los cambios a GitHub**
```bash
git push
```
¡Listo! Firebase App Hosting detectará los cambios y desplegará la nueva versión automáticamente.

---

## Configuración Inicial (Solo la primera vez)

Estos comandos son solo para la primera vez que configuras tu repositorio.

**Paso 1: Configura tu Identidad en Git (si es la primera vez)**
```bash
git config --global user.name "TU_NOMBRE_DE_USUARIO_GIT"
git config --global user.email "TU_EMAIL_DE_GIT@ejemplo.com"
```

**Paso 2: Inicia el Repositorio Local**
```bash
git init -b main
```

**Paso 3: Agrega todos los archivos iniciales**
```bash
git add .
```

**Paso 4: Crea tu primer "paquete" de cambios (commit)**
```bash
git commit -m "Versión Inicial del Proyecto"
```

**Paso 5: Conecta con tu repositorio en GitHub**
Reemplaza la URL con la de tu propio repositorio remoto.
```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
```
*Si te da un error que dice `remote origin already exists`, significa que ya había una conexión. Bórrala con `git remote remove origin` y repite el comando anterior.*

**Paso 6: ¡Sube el código por primera vez!**
```bash
git push -u origin main
```

---

## Desplegar en Firebase App Hosting

Una vez que tu código está en GitHub, puedes publicarlo para que todo el mundo lo vea.

1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/) y selecciona tu proyecto.
2.  En el menú, busca **Build** > **App Hosting**.
3.  Crea un nuevo backend y conéctalo a tu repositorio de GitHub.
4.  Asegúrate de configurar la **rama activa** para que sea `main`.
5.  ¡Finaliza y despliega! Firebase se encargará del resto y te dará una URL pública para tu app.
