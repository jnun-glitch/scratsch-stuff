# WONDERLING

TurboWarp/Scratch-Abenteuer über eine unbekannte Sprache.

## Idee

Der Spieler fällt in eine fremde Wunderwelt. Die NPCs sprechen zunächst unverständlich. Durch Situationen, Gegenstände, Gesten und wiederholte Wörter lernt der Spieler die Sprache Stück für Stück.

## Dateien

- `wonderling_engine.js` – TurboWarp Custom Extension
- `WONDERLING_GAME_DESIGN.md` – vollständiges Game-Design
- `README.md` – diese Anleitung

## TurboWarp laden

1. Öffne TurboWarp.
2. Öffne **Erweiterungen**.
3. Wähle **Benutzerdefinierte Erweiterung / Custom Extension**.
4. Öffne:
   `wonderling_engine.js`
5. Danach erscheint **Wonderling Engine** in den Blöcken.

## Schnelltest

Baue diese Blöcke:

```
Wenn grüne Flagge angeklickt
  Wonderling zurücksetzen
  Dialog starten [intro]
  sage (aktuelle Fantasiesprache der aktuellen Zeile) für 2 Sekunden
```

Für die nächste Zeile:

```
Wenn [Leertaste] gedrückt wird
  nächste Dialogzeile
```

Weitere Testblöcke:

```
setze Wort [luma] auf [75]%
sage (teilweise verstandene Übersetzung) für 2 Sekunden

Wort [luma] um [25]% lernen
sage (Sprachfortschritt von [luma] %) für 2 Sekunden

Beziehung zu [Mira] auf [25] setzen
sage (Beziehung zu [Mira]) für 2 Sekunden
```

## Eingebaute Dialoge

- `intro`
- `river`
- `gate`
- `clocktower`
- `ending`

## Hinweis

Die Extension ist die Logikschicht. Die sichtbare RPG-Dialogbox wird mit normalen TurboWarp/Scratch-Sprites gebaut.

Die Fantasiesprache soll nicht sofort komplett übersetzt werden. Das eigentliche Gameplay besteht darin, Bedeutungen selbst zu entdecken.
