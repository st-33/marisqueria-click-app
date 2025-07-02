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
