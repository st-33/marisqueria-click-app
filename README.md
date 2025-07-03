# MarisqueriaClick App

## Cómo subir tu código a GitHub

Aquí tienes los comandos que necesitas para subir tu código a tu repositorio de GitHub. Ejecútalos en la terminal de tu editor.

**Paso 1: Configura tu Identidad en Git (si es la primera vez)**

Esto le dice a Git quién eres. Si ya lo has hecho antes, puedes saltarte este paso.

```bash
git config --global user.name "TU_NOMBRE_DE_USUARIO_GIT"
git config --global user.email "TU_EMAIL_DE_GIT@ejemplo.com"
```

**Paso 2: Inicia el Repositorio Local**

Este comando convierte tu carpeta de proyecto actual en un repositorio de Git.
```bash
git init -b main
```

**Paso 3: Agrega todos los archivos**

Esto prepara todos los archivos de tu proyecto para subirlos.
```bash
git add .
```

**Paso 4: Crea tu primer "paquete" de cambios (commit)**

Esto guarda una "foto" de tus archivos con un mensaje descriptivo.
```bash
git commit -m "Versión Inicial del Proyecto"
```

**Paso 5: Conecta con tu repositorio en GitHub**

Reemplaza la URL con la de tu propio repositorio remoto.
```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
```
*Si te da un error que dice `remote origin already exists`, significa que ya había una conexión. Bórrala con `git remote remove origin` y repite el comando anterior.*

**Paso 6: ¡Sube el código!**

Este es el comando final que envía todo a GitHub.
```bash
git push -u origin main
```
¡Listo! Después de esto, tu código estará seguro en GitHub.

---

## Desplegar en Firebase App Hosting

Una vez que tu código está en GitHub, puedes publicarlo para que todo el mundo lo vea.

1.  Ve a la [Consola de Firebase](https://console.firebase.google.com/) y selecciona tu proyecto.
2.  En el menú, busca **Build** > **App Hosting**.
3.  Crea un nuevo backend y conéctalo a tu repositorio de GitHub.
4.  Asegúrate de configurar la **rama activa** para que sea `main`.
5.  ¡Finaliza y despliega! Firebase se encargará del resto y te dará una URL pública para tu app.
