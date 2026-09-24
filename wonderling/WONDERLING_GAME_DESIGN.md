# WONDERLING – Das verlorene Wunderland
## Game Design & Entwicklungsplan für Scratch/TurboWarp

> Ein storybasiertes 2D-Abenteuer: Der Spieler fällt in eine seltsame Welt, deren Bewohner eine unbekannte Sprache sprechen. Durch Beobachtung, Rätsel, Gesten und wiederkehrende Wörter lernt der Spieler die Sprache Schritt für Schritt.

---

## 1. Spielidee

Der Spieler stürzt durch ein geheimnisvolles Portal und landet in **Wunderling**, einer Welt voller schwebender Inseln, sprechender Tiere, lebender Häuser und merkwürdiger Regeln.

Am Anfang verstehen die Bewohner den Spieler nicht – und der Spieler versteht sie ebenfalls nicht. Ihre Sprache besteht aus Fantasiewörtern, Symbolen und Gesten.

Das Spiel soll nicht einfach automatisch übersetzen. Der Spieler muss selbst Zusammenhänge erkennen:

- Ein NPC zeigt auf Wasser und sagt immer wieder „Luma“.
- Später zeigt ein anderer NPC auf einen Becher und sagt „Luma?“
- Der Spieler erkennt: „Luma“ könnte Wasser bedeuten.
- Durch weitere Situationen wird die Vermutung bestätigt oder korrigiert.

**Ziel:** Die Sprache verstehen, Vertrauen aufbauen und herausfinden, warum das Portal den Spieler in diese Welt gebracht hat.

---

## 2. Spielgefühl

Inspiration:

- Alice im Wunderland
- Chants of Sennaar
- Heaven’s Vault
- klassische Point-and-Click-Abenteuer
- Mystery- und Entdeckungsspiele

Das Spiel soll wirken wie:

- seltsam, aber freundlich
- geheimnisvoll
- manchmal lustig
- voller kleiner Details
- mit einer Welt, die auf die Entscheidungen des Spielers reagiert

---

## 3. Kern-Gameplay-Loop

1. Erkunden
2. NPC beobachten
3. Unbekannte Wörter hören oder lesen
4. Gegenstände und Gesten untersuchen
5. Wörter im Wörterbuch speichern
6. Vermutungen über Bedeutungen aufstellen
7. Dialogoptionen ausprobieren
8. Neue Bereiche und Story-Informationen freischalten

---

## 4. Sprachsystem

### 4.1 Fantasiesprache

Beispielwörter:

| Fantasiewort | Mögliche Bedeutung | Sicherheit |
|---|---|---:|
| Luma | Wasser | 0–100 % |
| Neko | Freund | 0–100 % |
| Varo | Gefahr | 0–100 % |
| Seli | Essen | 0–100 % |
| Tava | Komm | 0–100 % |
| Oro | Tür | 0–100 % |
| Miri | Danke | 0–100 % |
| Kanu | Nein | 0–100 % |

Die Bedeutungen dürfen zunächst falsch sein. Der Spieler muss sie durch weitere Hinweise überprüfen.

### 4.2 Wörterbuch-Daten

Jedes Wort sollte folgende Daten besitzen:

```text
wordId
fantasyWord
possibleMeaning
confidence
category
firstEncounter
knownExamples
isConfirmed
```

Beispiel:

```json
{
  "wordId": "luma",
  "fantasyWord": "Luma",
  "possibleMeaning": "Wasser",
  "confidence": 72,
  "category": "Gegenstand",
  "firstEncounter": "npc_001",
  "knownExamples": [
    "NPC zeigt auf einen Fluss",
    "NPC zeigt auf einen Becher"
  ],
  "isConfirmed": false
}
```

### 4.3 Lernstufen

- **0 %:** Das Wort ist unbekannt.
- **25 %:** Der Spieler hat das Wort gehört.
- **50 %:** Es gibt einen ersten Zusammenhang.
- **75 %:** Mehrere Hinweise bestätigen die Bedeutung.
- **100 %:** Die Bedeutung gilt als gelernt.

---

## 5. Dialogsystem

### 5.1 Dialogarten

1. **Unverständlicher Dialog**
   - NPC spricht nur Fantasiesprache.
   - Untertitel zeigen die Wörter, aber keine Übersetzung.

2. **Gesten-Dialog**
   - NPC zeigt auf einen Gegenstand.
   - NPC führt eine Handlung aus.
   - Der Spieler kann die Bedeutung vermuten.

3. **Teilweise verstandener Dialog**
   - Bekannte Wörter werden hervorgehoben.
   - Unbekannte Wörter bleiben geheimnisvoll.

4. **Vollständig verstandener Dialog**
   - Der Spieler versteht den Satz.
   - Neue Antworten und Story-Wege werden freigeschaltet.

### 5.2 Dialog-Datenstruktur

```json
{
  "dialogId": "intro_npc_001",
  "speaker": "npc_001",
  "lines": [
    {
      "text": "Neko luma tava?",
      "translation": "Freund, komm zum Wasser?",
      "requiredWords": ["neko", "luma", "tava"],
      "emotion": "curious",
      "gesture": "points_to_river"
    }
  ],
  "choices": [
    {
      "text": "Auf den Fluss zeigen",
      "result": "learn_luma_hint"
    },
    {
      "text": "Kopf schütteln",
      "result": "npc_confused"
    }
  ]
}
```

**Wichtig:** Die vollständige Übersetzung darf intern gespeichert sein, aber dem Spieler nur angezeigt werden, wenn die notwendigen Wörter gelernt wurden.

---

## 6. Dialogfenster in Scratch/TurboWarp

Das Dialogfenster sollte aus mehreren Sprites oder Klonen bestehen:

```text
DialogueManager
├── DialogueBox
├── SpeakerName
├── DialogueText
├── KnownWordHighlight
├── ChoiceButton_1
├── ChoiceButton_2
├── ChoiceButton_3
├── ContinueButton
└── DictionaryButton
```

### Benötigte Variablen

```text
dialogue_active
current_dialogue_id
current_line_index
current_speaker
current_text
current_translation
translation_percentage
choice_count
selected_choice
```

### Grundablauf

```text
Wenn [E] gedrückt wird
  falls dialogue_active = 0
    prüfe NPC in der Nähe
    starte passenden Dialog
  sonst
    zeige nächste Dialogzeile
```

### Dialog starten

```text
definiere [Start Dialog (dialogId)]
setze [current_dialogue_id] auf (dialogId)
setze [current_line_index] auf (1)
setze [dialogue_active] auf (1)
sende [Dialog aktualisieren]
```

---

## 7. TurboWarp-JavaScript-Erweiterung

TurboWarp kann eigene JavaScript-Blöcke über Custom Extensions laden. Solche Erweiterungen sind nicht mit der normalen Scratch-Webseite kompatibel und sollten für dieses Projekt in TurboWarp verwendet werden.

Dokumentation:

- https://docs.turbowarp.org/development/extensions/introduction
- https://docs.turbowarp.org/development/extensions/unsandboxed
- https://extensions.turbowarp.org/

### Geplante Erweiterungsblöcke

Die Erweiterung könnte später Blöcke bereitstellen wie:

```text
[Dialog starten mit ID (intro_npc_001)]
[Dialogzeile (1) von (intro_npc_001)]
[Übersetzungsgrad von Wort (luma)]
[Wort (luma) als gelernt markieren]
[Ist Wort (luma) bekannt?]
[Öffne Wörterbuch]
[Setze NPC-Beziehung von (npc_001) auf (25)]
```

### Minimaler Prototyp einer Reporter-Erweiterung

Datei: `wonderling_dialogue.js`

```javascript
(function (Scratch) {
  "use strict";

  class WonderlingDialogue {
    getInfo() {
      return {
        id: "wonderlingdialogue",
        name: "Wonderling Dialog",
        color1: "#7C5CFC",
        color2: "#6246C7",
        color3: "#4A3498",
        blocks: [
          {
            opcode: "makeFantasyLine",
            blockType: Scratch.BlockType.REPORTER,
            text: "Fantasiesatz aus [WORD1] und [WORD2]",
            arguments: {
              WORD1: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Neko"
              },
              WORD2: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Luma"
              }
            }
          },
          {
            opcode: "translationProgress",
            blockType: Scratch.BlockType.REPORTER,
            text: "Übersetzungsfortschritt von [WORD]",
            arguments: {
              WORD: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "luma"
              }
            }
          }
        ]
      };
    }

    makeFantasyLine(args) {
      return `${args.WORD1} ${args.WORD2}`;
    }

    translationProgress(args) {
      const knownWords = {
        luma: 72,
        neko: 25,
        varo: 0,
        seli: 50
      };

      const word = String(args.WORD).toLowerCase();
      return knownWords[word] ?? 0;
    }
  }

  Scratch.extensions.register(new WonderlingDialogue());
})(Scratch);
```

### Erweiterung laden

1. Code als `wonderling_dialogue.js` speichern.
2. TurboWarp öffnen.
3. Erweiterungen hinzufügen.
4. **Custom Extension** auswählen.
5. Datei laden oder den JavaScript-Code einfügen.
6. Zunächst ohne „unsandboxed“ testen.
7. Die neuen Blöcke im Projekt verwenden.

Für einfache Reporter-Blöcke reicht eine sandboxed Extension. Für direkten Zugriff auf Projektvariablen, Sprites oder eigene Events kann später eine unsandboxed Extension notwendig sein. Diese sollte nur mit vertrauenswürdigem, selbst geprüftem Code verwendet werden.

---

## 8. Weltaufbau

### Gebiet 1: Der Fall

- Spieler fällt durch ein Portal.
- Kurze Einführung ohne verständliche Sprache.
- Ein NPC findet den Spieler.
- Erste Wörter werden gehört.
- Der Spieler lernt die Bedeutung von „Luma“.

### Gebiet 2: Das schiefe Dorf

- Häuser stehen an Wänden.
- Bewohner benutzen unterschiedliche Gesten.
- Ein Händler spricht besonders schnell.
- Der Spieler erhält das erste Wörterbuch.

### Gebiet 3: Der singende Wald

- Pflanzen reagieren auf bestimmte Wörter.
- Tiere wiederholen Wörter.
- Der Spieler muss eine Reihenfolge verstehen.

### Gebiet 4: Der Uhrturm

- Zeit läuft rückwärts.
- Dialoge verändern sich je nach Tageszeit.
- Ein NPC kennt Hinweise zum Portal.

### Gebiet 5: Das Tor hinter der Welt

- Der Spieler versteht fast alle wichtigen Wörter.
- Frühere Dialoge ergeben neue Bedeutungen.
- Mehrere Enden sind möglich.

---

## 9. NPC-System

Jeder NPC sollte Daten besitzen:

```text
npcId
name
position
emotion
currentSchedule
relationship
knownWords
favoriteItem
storyRole
dialoguePool
```

### NPC-Verhalten

- morgens: arbeitet
- mittags: spricht mit anderen NPCs
- abends: geht nach Hause
- bei Regen: sucht Schutz
- bei Gefahr: warnt andere
- bei hoher Beziehung: gibt zusätzliche Hinweise

### Beziehungssystem

```text
-100 = feindselig
-50  = misstrauisch
0    = neutral
25   = freundlich
50   = vertraut
100  = enger Verbündeter
```

Die Beziehung verändert Dialoge, Gesten und verfügbare Aufgaben.

---

## 10. Rätselideen

### Rätsel 1: Das Wasserwort

Ein NPC sagt „Luma“ und zeigt auf einen Fluss. Später zeigt er auf einen leeren Becher. Der Spieler muss erkennen, dass „Luma“ Wasser bedeutet.

### Rätsel 2: Die falsche Übersetzung

Ein Wort wird zuerst als „Tür“ vermutet. Später zeigt ein NPC auf einen Weg. Der Spieler muss die Bedeutung korrigieren.

### Rätsel 3: Die höfliche Antwort

Ein NPC fragt etwas. Nur wenn der Spieler die Wörter in der richtigen Reihenfolge auswählt, öffnet sich ein neuer Weg.

### Rätsel 4: Das lebende Schild

Ein Schild zeigt Symbole statt Text. Durch gelernte Wörter kann der Spieler die Warnung verstehen.

---

## 11. Speichersystem

Speicherbare Daten:

```text
player_x
player_y
current_area
learned_words
word_confidence
npc_relationships
completed_quests
opened_paths
story_flags
current_dialogue_state
```

In TurboWarp kann ein lokales Speichersystem verwendet werden. Für eine erste Scratch-Version reicht es, die Daten in Variablen und Listen zu verwalten.

---

## 12. Projektstruktur

```text
Wonderling/
├── README.md
├── GAME_DESIGN.md
├── DIALOGUE_SYSTEM.md
├── LANGUAGE_SYSTEM.md
├── NPC_SYSTEM.md
├── QUEST_SYSTEM.md
├── TESTING.md
├── extensions/
│   └── wonderling_dialogue.js
├── data/
│   ├── words.json
│   ├── dialogues.json
│   ├── npcs.json
│   └── quests.json
└── assets/
    ├── backgrounds/
    ├── characters/
    ├── ui/
    └── sounds/
```

In einem echten Scratch-Projekt werden die Daten zunächst am einfachsten durch Listen und Variablen ersetzt. JSON-Dateien und JavaScript-Erweiterungen kommen schrittweise dazu.

---

## 13. Entwicklungsphasen

### Phase 1 – Grundgerüst

- [ ] Spielerbewegung
- [ ] eine kleine Testkarte
- [ ] ein NPC
- [ ] einfache Interaktion mit E
- [ ] Dialogfenster

### Phase 2 – Sprache

- [ ] Fantasiewörter
- [ ] Wörterbuch
- [ ] Wort-Sicherheitswerte
- [ ] Hinweise durch Gesten
- [ ] bekannte und unbekannte Wörter unterschiedlich anzeigen

### Phase 3 – Entscheidungen

- [ ] Antwortbuttons
- [ ] Dialogverzweigungen
- [ ] Story-Flags
- [ ] einfache NPC-Beziehungen

### Phase 4 – Welt

- [ ] mehrere Gebiete
- [ ] NPC-Zeitpläne
- [ ] Rätsel
- [ ] geheime Wege
- [ ] Musik und Soundeffekte

### Phase 5 – Polishing

- [ ] Animationen
- [ ] besseres UI
- [ ] Speichern und Laden
- [ ] Fehlerbehebung
- [ ] Testdurchläufe
- [ ] TurboWarp-Projekt exportieren

---

## 14. Testplan

### Dialogtests

- Startet der Dialog nur bei einem NPC?
- Wird die nächste Zeile korrekt angezeigt?
- Funktioniert der Weiter-Button?
- Werden unbekannte Wörter nicht zu früh übersetzt?
- Funktionieren alle Antwortmöglichkeiten?

### Sprachtests

- Wird ein Wort nur durch passende Hinweise gelernt?
- Kann eine falsche Vermutung korrigiert werden?
- Wird der Fortschritt gespeichert?
- Bleiben gelernte Wörter nach einem Szenenwechsel erhalten?

### Welt-Tests

- Kann der Spieler nicht durch Wände laufen?
- Werden NPCs korrekt angezeigt?
- Funktionieren Gebietswechsel?
- Reagieren NPCs auf Story-Flags?

### TurboWarp-Tests

- Lädt die Custom Extension ohne Syntaxfehler?
- Funktionieren alle Blöcke?
- Gibt es Fehler in der Browser-Konsole?
- Funktioniert das Spiel auch nach dem Export?

---

## 15. Designregeln

- Keine „Coming Soon“-Bereiche.
- Keine bloßen Platzhalter als fertige Funktionen ausgeben.
- Erst ein kleines, funktionierendes Grundgerüst bauen.
- Danach jede Funktion einzeln testen.
- Daten und Spiel-Logik voneinander trennen.
- Dialoge so speichern, dass sie leicht geändert werden können.
- Keine automatische Übersetzung als Ersatz für das eigentliche Gameplay.
- Fehler verständlich anzeigen.
- Jede neue Funktion muss mit einem kleinen Test überprüft werden.

---

## 16. Erste spielbare Version

Die erste Version sollte nur Folgendes enthalten:

1. Eine Hintergrundszene.
2. Einen steuerbaren Spieler.
3. Einen NPC.
4. Einen Dialog mit drei Fantasiewörtern.
5. Einen Gegenstand, auf den der NPC zeigt.
6. Ein Wörterbuch.
7. Eine Lernanzeige für ein Wort.
8. Eine kleine Entscheidung.
9. Einen neuen Dialog, sobald das Wort gelernt wurde.

Wenn diese Version funktioniert, wird das Spiel Schritt für Schritt erweitert.

---

## 17. Quellen und technische Hinweise

- TurboWarp Custom Extensions:
  https://docs.turbowarp.org/development/extensions/introduction

- TurboWarp Hello World Extension:
  https://docs.turbowarp.org/development/extensions/hello-world

- Unsandboxed Extensions:
  https://docs.turbowarp.org/development/extensions/unsandboxed

- TurboWarp Extension Gallery:
  https://extensions.turbowarp.org/

- TurboWarp Blocks:
  https://docs.turbowarp.org/blocks

---

## Kurzfassung

**Wonderling** ist ein Sprachlern-Abenteuer in einer verrückten Wunderwelt. Der Spieler versteht die Bewohner nicht sofort, sondern erschließt ihre Sprache durch Beobachtung, Rätsel, Gesten und wiederholte Begegnungen. Scratch übernimmt die Spielmechanik, während TurboWarp-JavaScript-Erweiterungen später komplexere Dialog-, Wörterbuch- und Speichersysteme ermöglichen.