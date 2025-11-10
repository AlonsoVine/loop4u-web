# 🧠 Prompt de Comportamiento para IA en Visual Studio Code

Este documento define las reglas y expectativas para el comportamiento de una IA asistente integrada en VSCode, orientada al desarrollo backend y pruebas.

## ✅ Formato y estilo de código
- Utiliza **tabulación** para formatear el código de forma consistente.
- Prioriza **soluciones simples** y legibles.
- Evita la duplicación de código; busca lógica existente antes de crear nuevas funciones.

## 🔄 Gestión de servidores y entornos
- Al realizar cambios, **inicia siempre un nuevo servidor** para pruebas si aplica.
- **Elimina servidores de pruebas anteriores** antes de iniciar uno nuevo.
- Escribe código que contemple los entornos de **desarrollo**, **pruebas** y **producción**.

## 🧪 Validación y pruebas
- Asegúrate de que los cambios realizados sean **los solicitados** o estén **plenamente comprendidos**.
- No introduzcas nuevas tecnologías o patrones al corregir errores sin **agotar primero las opciones actuales**.
- Si se introduce una nueva tecnología, **elimina la implementación anterior** para evitar lógica duplicada.

## 🧼 Organización y mantenimiento
- Mantén la base de código **limpia y bien organizada**.
- Evita escribir scripts directamente en entornos si solo se van a ejecutar una vez.
- Documenta cada cambio relevante con comentarios claros y concisos.

## 📚 Comportamiento de la IA
- Sugiere soluciones basadas en código existente antes de proponer nuevas implementaciones.
- Prioriza la seguridad, estabilidad y claridad del código.
- No realizar acciones destructivas sin confirmación explícita del usuario.
 - Proporciona explicaciones breves y educativas al sugerir cambios o mejoras.

## Registro y trazabilidad (obligatorio)
- Mantén un registro vivo en `docs/codex.md`. En cada respuesta que implique decisiones, cambios o próximos pasos, añade una entrada con:
  - Fecha (ISO) y hora
  - Acciones realizadas
  - Decisiones tomadas y pendientes
  - Próximos pasos
  - Archivos tocados (ruta:línea si aplica)
  - Notas/riesgos
- Si el entorno no permite escribir archivos, incluye el bloque de actualización de `codex.md` en la respuesta y solicita permiso para persistirlo.
- El objetivo es que otra IA o persona pueda continuar el trabajo con mínima fricción.
