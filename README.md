# Guía Definitiva: Conectar tu Proyecto a GitHub desde Cero

¡Listo, carnal! Aquí tienes la guía paso a paso, con los comandos exactos que necesitas para subir tu código a tu nuevo repositorio `marisqueria-click-app`.

**OJO:** Estos comandos los tienes que ejecutar en la terminal de tu editor de código.

---

### Paso 1: Configura tu Identidad en Git (Si es la primera vez)

Esto le dice a Git quién eres. Si ya lo has hecho antes en esta computadora, puedes saltarte este paso, pero no está de más verificar.

```bash
git config --global user.name "st-33"
git config --global user.email "miclovinmelapelan@gmail.com"
```

---

### Paso 2: Inicia tu Repositorio Local

Este comando convierte tu carpeta de proyecto actual en un repositorio de Git y crea la rama principal llamada `main`. Si ya existía un repositorio anterior, este comando lo reiniciará.

```bash
git init -b main
```

---

### Paso 3: Prepara Todos los Archivos para Subir

Esto es como meter todos tus archivos en una caja de mudanza. El punto `.` significa "todo lo que hay en esta carpeta".

```bash
git add .
```

---

### Paso 4: Empaqueta los Archivos con una Etiqueta

Ahora que los archivos están en la caja, la sellamos y le ponemos una etiqueta. Este es tu primer "commit".

```bash
git commit -m "Versión Inicial del Proyecto"
```

---

### Paso 5: Apunta a la Dirección Correcta en GitHub

Este es el paso crucial. Le dices a tu computadora la dirección de tu nuevo repositorio en GitHub.

```bash
git remote add origin https://github.com/st-33/marisqueria-click-app.git
```

**Si te da un error** que dice `remote origin already exists`, significa que aún recuerda la conexión vieja. Simplemente ejecuta este comando para borrarla y luego repite el comando de arriba:
```bash
git remote remove origin
```

---

### Paso 6: ¡Envía Todo a la Nube!

Este es el último comando. Empuja todo tu código desde tu computadora a la rama `main` de tu repositorio en GitHub. La opción `-u` hace que se recuerde esta conexión para el futuro.

```bash
git push -u origin main
```

---

¡Y listo! Después de ejecutar ese último comando, si refrescas la página de tu repositorio en GitHub, verás todo tu código ahí. A partir de ese momento, ya podemos seguir trabajando normalmente desde el editor.

---

## Parte 2: Desplegar la App en Firebase

¡Excelente! Ya tienes tu código en GitHub. Ahora vamos a publicarlo para que el mundo lo vea.

### Paso 1: Ve a la Consola de Firebase

1.  Abre tu navegador y ve a la [Consola de Firebase](https://console.firebase.google.com/).
2.  Selecciona tu proyecto `marisqueriaclick`.

### Paso 2: Entra a App Hosting

1.  En el menú de la izquierda, busca la sección **`Build` (Desarrollo)**.
2.  Haz clic en **`App Hosting`**.

### Paso 3: Crea tu Backend

1.  Verás un botón grande que dice **`Crear backend`**. Dale clic.
2.  Te pedirá que te conectes con GitHub. Si no lo has hecho, te pedirá permiso para acceder a tus repositorios. **Acepta sin miedo.**
3.  Una vez conectado, te mostrará una lista de tus repositorios. Busca y selecciona el que acabamos de crear: **`st-33/marisqueria-click-app`**.

### Paso 4: Configura el Despliegue

Esto es lo más importante. Te aparecerá un formulario con dos campos:

1.  **Directorio raíz:** Déjalo como está. Debe decir **`/`**.
2.  **Rama activa para implementaciones de producción:** Aquí es donde le dices a Firebase qué rama vigilar. Escribe **`main`**.

Dale clic a **`Finalizar e implementar`**.

### Paso 5: ¡A Esperar (Un Poquito)!

Firebase empezará a trabajar. Verás una pantalla que dice que está construyendo y desplegando tu app. Esto puede tardar unos minutos (5-10 min la primera vez).

Cuando termine, te dará una URL pública (algo como `marisqueria-click-app--xxxxx.web.app`). **¡Esa es tu aplicación en vivo!**

A partir de ahora, cada vez que subas un cambio a la rama `main` de tu repositorio en GitHub, Firebase lo detectará y desplegará la nueva versión automáticamente. ¡Ya no tienes que hacer nada más!
