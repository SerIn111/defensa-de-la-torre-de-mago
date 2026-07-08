# Plan de Implementación: Defensa de la Torre de Magos

Este documento detalla la arquitectura, las lógicas de los modos de juego y el esquema de trabajo utilizando Phaser.js para desarrollar el juego 2D Top-Down "Defensa de la Torre de Magos".

## User Review Required

> [!IMPORTANT]
> Revisa la lógica detallada para los 3 modos de juego y la estructura de delegación de agentes. Una vez que apruebes este plan, comenzaremos con la configuración del proyecto y la generación del código base.

## Open Questions

> [!WARNING]
> ¿Tienes preferencias sobre cómo deben lucir los assets generados por IA (estilo pixel art, cartoon, oscuro, etc.)?  
> ¿Deseas utilizar un empaquetador moderno como Vite (recomendado para Phaser 3 con ES6 Modules) o prefieres una estructura tradicional con scripts en el HTML?

## Arquitectura del Proyecto

Se utilizará una arquitectura basada en Escenas de Phaser 3, dividiendo las responsabilidades lógicamente. Se propone el uso de Vite como bundler para facilitar el manejo de assets y módulos ES6.

### Estructura de Archivos
* **`index.html`**: Punto de entrada de la aplicación.
* **`src/main.js`**: Configuración global del juego de Phaser y registro de escenas.
* **`src/scenes/Boot.js`**: Escena inicial encargada de cargar los assets (imágenes, spritesheets, audio) y mostrar una barra de progreso.
* **`src/scenes/MainMenu.js`**: Pantalla de inicio con el título "Defensa de la Torre" y los botones para seleccionar los 3 modos de juego.
* **`src/scenes/Game.js`**: Escena principal que gestionará la lógica del juego. Recibirá el modo seleccionado como parámetro y adaptará las mecánicas en consecuencia.
* **`src/objects/`**: Clases para entidades del juego (`Player.js`, `Enemy.js`, `Crystal.js`, `Spell.js`).

---

## Lógica de los Modos de Juego

### Modo Básico (Nivel 1)
* **Objetivo:** Sobrevivir 60 segundos.
* **Mecánicas:**
  * **Jugador:** Movimiento en 8 direcciones usando teclado (WASD o Flechas).
  * **Cristal:** Ubicado en el centro `(x: width/2, y: height/2)`. Tiene 3 puntos de vida (HP).
* **Enemigos:** 
  * Un solo tipo de enemigo (Demonio Básico).
  * **Comportamiento:** Spawnean en los bordes de la pantalla (arriba, abajo, izquierda, derecha) y se mueven en línea recta hacia las coordenadas del cristal.
* **Condiciones de Fin:**
  * **Derrota (Game Over):** El cristal recibe 3 golpes.
  * **Victoria:** El temporizador interno de 60 segundos llega a 0.

### Modo Intermedio (Nivel 2)
* **Objetivo:** Sobrevivir 60 segundos y obtener la mayor puntuación posible.
* **Mecánicas Adicionales:** 
  * Sistema de puntuación en pantalla (ej. +10 por demonio, +50 por Golem).
  * El jugador ya puede atacar a los enemigos (para poder sumar puntos y destruirlos).
* **Enemigos:**
  * **Demonio Menor:** Alta velocidad de movimiento, 1 HP (muere de un golpe).
  * **Golem Oscuro:** Baja velocidad de movimiento, 3 HP (requiere 3 hechizos para ser destruido).
* **Fases:**
  * **Fase 1 (0s - 30s):** Frecuencia de aparición (spawn rate) normal. Principalmente Demonios Menores, un Golem ocasional.
  * **Fase 2 (30s - 60s):** Frecuencia de aparición aumentada al doble. Mayor proporción de Golems Oscuros.

### Modo Avanzado (Nivel 3)
* **Objetivo:** Sobrevivir 60 segundos con mecánicas completas.
* **Mecánicas Adicionales:**
  * **Combate (Hechizos Elementales):** El jugador dispara proyectiles mágicos en la dirección en la que se hace clic con el mouse (apuntar con el cursor). Los proyectiles tienen velocidad y destruyen/dañan enemigos al colisionar.
  * **Progresión (Barrera Estática):** Al presionar la barra espaciadora, se invoca un escudo alrededor del cristal. Los enemigos que tocan el escudo son repelidos o destruidos. Tiene una duración limitada (ej. 3 segundos) y un tiempo de recarga o *cooldown* (ej. 10 segundos).
* **Audio:**
  * SFX de disparo para los hechizos.
  * SFX de impacto/muerte de los enemigos.
  * Música de fondo (BGM) épica/de batalla en bucle.

---

## Plan de Delegación (Agent Manager)

Para modularizar el desarrollo de características avanzadas, se estructurará el código para que sea fácilmente intervenido por los agentes del Agent Manager:

### Agente 1: Lógica de Oleadas y Daño
* **Responsabilidad:** Implementar el `WaveManager` (Fase 1 y Fase 2, temporizadores, curvas de dificultad) y el sistema de colisiones matemáticas.
* **Archivos a modificar:** `src/scenes/Game.js`, `src/objects/Enemy.js`, creación de un `WaveManager.js`.

### Agente 2: Efectos Visuales (Sprites y Partículas)
* **Responsabilidad:** Reemplazar los *placeholders* visuales con sprites generados o implementados. Añadir un `ParticleManager` en Phaser para explosiones de hechizos, destellos al golpear enemigos y el efecto visual brillante de la Barrera de Cristal.
* **Archivos a modificar:** `src/scenes/Boot.js` (carga de texturas), `src/objects/Spell.js` (partículas de arrastre), animaciones del jugador.

### Agente 3: Integración de Audio
* **Responsabilidad:** Gestionar la carga y reproducción de sonidos. Implementar control de volumen y canales para que los SFX de hechizos no se superpongan de manera molesta y la BGM fluya correctamente con las transiciones de Menú a Juego.
* **Archivos a modificar:** `src/scenes/Boot.js` (carga de audio), llamadas al sistema `this.sound.play()` en eventos específicos.

## Plan de Verificación

### Verificación Manual
- Iniciar un servidor de desarrollo local (ej. `npm run dev`).
- Comprobar que la pantalla de inicio cargue y permita seleccionar los tres modos.
- Probar que el Modo 1 termina correctamente en victoria (60s) o derrota (3 golpes al cristal).
- Probar que el Modo 2 incrementa la dificultad a los 30s y registra puntuación.
- Probar el movimiento, el disparo hacia el mouse y la barrera con *cooldown* en el Modo 3.
