# WONDERLING

TurboWarp/Scratch-Abenteuer über eine unbekannte Sprache.

## Wichtig: Dialogfenster

Die neue Extension besitzt eine **echte Dialogbox direkt über der TurboWarp-Bühne**.

Sie muss deshalb in TurboWarp als **„Ohne Sandbox / Unsandboxed“** geladen werden. Unsandboxed Extensions können auf die TurboWarp-VM und den DOM-Zugriff zugreifen; das wird auch bei vergleichbaren TurboWarp-Erweiterungen so verwendet. citehttps://docs.turbowarp.org/development/extensions/unsandboxed

## Installation

1. TurboWarp öffnen.
2. Erweiterungen öffnen.
3. Benutzerdefinierte Erweiterung / Custom Extension auswählen.
4. `wonderling_engine.js` auswählen.
5. Beim Laden **Ohne Sandbox / Unsandboxed** aktivieren.
6. Danach erscheint **Wonderling Dialog UI**.

## Soforttest

Diese Blöcke reichen:

```
Wenn grüne Flagge angeklickt
Wonderling zurücksetzen
Dialog starten [intro]
```

Danach erscheint automatisch die Dialogbox.

**Weiter:** Space, Enter, E oder die Schaltfläche „Weiter“.

**Schließen:** Escape oder „Schließen“.

**Hinweis:** Die Sprache ist absichtlich nicht sofort komplett übersetzt.

## Eingebaute Dialoge

- `intro`
- `river`
- `gate`
- `clocktower`
- `ending`

## Sprache

Wörter werden schrittweise gelernt. Unbekannte Wörter bleiben teilweise verborgen. Das Wörterbuch zeigt entdeckte Wörter.

## Technische Dateien

- `wonderling_engine.js` – Dialog-UI + Sprachengine
- `WONDERLING_GAME_DESIGN.md` – Game Design
- `README.md` – diese Anleitung

## TurboWarp

Dokumentation:
- https://docs.turbowarp.org/development/extensions/introduction
- https://docs.turbowarp.org/development/extensions/unsandboxed
