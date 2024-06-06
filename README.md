# Primeros pasos

Primero, instala las dependencias y luego puedes levantar el proyecto en desarrollo:

```bash
npm install
npm run dev
```
Abre [http://localhost:3000](http://localhost:3000) para ver el proyecto.

# Estructura

## PrimeReact
El proyecto esta basado en una plantilla proveída por PrimeReact, que además brinda diferentes componentes que facilitan el desarrollo frontend en NextJs.
Para más información dejo el enlace: [https://primereact.org/](https://primereact.org/)

## Redux 
El sistema utiliza redux para almacenar los siguientes datos:
- Datos del usuario. `reducers/usuario.js`
- Barra de progreso `reducers/progreso.js`. Se utiliza para mostrar un barra de progreso en la web cuando se realiza una petición.

## Middleware
Existe un archivo `middleware.js` en la raíz del proyecto que realiza la validación del token, es decir, verifica que exista un token en la cookie y lo valida para poder habilitar las rutas protegidas.

## Rutas
Dentro del archivo `utils/routes.js` están todas las rutas del proyecto para un mejor manejo de las mismas. En el caso de que se necesite cambiar alguna ruta se puede realizar desde el mencionado archivo.

## Variables de entorno
En el archivo `utils/enviroment.js` se importa todas las variables de entorno para mejor manejo de las mismas.

## Broadcrumb
El archivo `utils/broadcrumb.js` es un componente que recibe como dato la ruta actual para poder generar una guía de ubicación para el usuario.

# Test
Se pueden ejecutar test end to end en el proyecto. Estan hechos con cypress.
Para poder ejecutarlse utilizar el comando. 
```bash
npm test
```