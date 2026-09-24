/*
 * WONDERLING DIALOGUE ENGINE
 * TurboWarp Custom Extension
 * Version 1.1.0
 *
 * Designed for sandboxed TurboWarp custom extensions.
 * No external libraries and no network access required.
 *
 * Main idea:
 * - NPCs speak an unknown fantasy language.
 * - The player learns words gradually.
 * - Dialog text can show partial translations.
 * - Confidence/knowledge is stored inside the extension while the project runs.
 */

(function (Scratch) {
  "use strict";

  const DEMO_WORDS = {
    luma: {
      meaning: "Wasser",
      category: "Gegenstand",
      confidence: 0
    },
    neko: {
      meaning: "Freund",
      category: "Person",
      confidence: 0
    },
    varo: {
      meaning: "Gefahr",
      category: "Warnung",
      confidence: 0
    },
    seli: {
      meaning: "Essen",
      category: "Gegenstand",
      confidence: 0
    },
    tava: {
      meaning: "Komm",
      category: "Aktion",
      confidence: 0
    },
    oro: {
      meaning: "Tür",
      category: "Ort",
      confidence: 0
    },
    miri: {
      meaning: "Danke",
      category: "Höflichkeit",
      confidence: 0
    },
    kanu: {
      meaning: "Nein",
      category: "Antwort",
      confidence: 0
    },
    yava: {
      meaning: "gehen",
      category: "Aktion",
      confidence: 0
    },
    rina: {
      meaning: "Haus",
      category: "Ort",
      confidence: 0
    },
    saro: {
      meaning: "Hallo",
      category: "Höflichkeit",
      confidence: 0
    },
    nava: {
      meaning: "bitte",
      category: "Höflichkeit",
      confidence: 0
    },
    tora: {
      meaning: "Schlüssel",
      category: "Gegenstand",
      confidence: 0
    },
    mira: {
      meaning: "sehen",
      category: "Wahrnehmung",
      confidence: 0
    },
    noro: {
      meaning: "jetzt",
      category: "Zeit",
      confidence: 0
    },
    velo: {
      meaning: "später",
      category: "Zeit",
      confidence: 0
    }
  };

  const DEMO_DIALOGUES = {
    intro: {
      speaker: "Mira",
      lines: [
        {
          fantasy: "Neko tava?",
          translation: "Freund, komm?",
          emotion: "verwirrt"
        },
        {
          fantasy: "Luma. Luma!",
          translation: "Wasser. Wasser!",
          emotion: "dringend"
        },
        {
          fantasy: "Miri.",
          translation: "Danke.",
          emotion: "freundlich"
        }
      ]
    },

    river: {
      speaker: "Mira",
      lines: [
        {
          fantasy: "Luma.",
          translation: "Wasser.",
          emotion: "ruhig"
        },
        {
          fantasy: "Luma yava.",
          translation: "Zum Wasser gehen.",
          emotion: "freundlich"
        }
      ]
    },

    gate: {
      speaker: "Torwächter",
      lines: [
        {
          fantasy: "Oro?",
          translation: "Tür?",
          emotion: "fragend"
        },
        {
          fantasy: "Tora?",
          translation: "Schlüssel?",
          emotion: "fragend"
        },
        {
          fantasy: "Varo! Kanu!",
          translation: "Gefahr! Nein!",
          emotion: "ängstlich"
        }
      ]
    },

    clocktower: {
      speaker: "Echo",
      lines: [
        {
          fantasy: "Mira noro.",
          translation: "Schau jetzt.",
          emotion: "mysteriös"
        },
        {
          fantasy: "Oro velo.",
          translation: "Das Tor später.",
          emotion: "ruhig"
        },
        {
          fantasy: "Saro.",
          translation: "Hallo.",
          emotion: "ruhig"
        }
      ]
    },

    ending: {
      speaker: "Echo",
      lines: [
        {
          fantasy: "Neko tava. Oro.",
          translation: "Freund, komm. Zum Tor.",
          emotion: "ernst"
        },
        {
          fantasy: "Miri.",
          translation: "Danke.",
          emotion: "warm"
        }
      ]
    }
  };

  class WonderlingDialogue {
    constructor() {
      this.words = this.cloneWords(DEMO_WORDS);
      this.dialogues = this.cloneDialogues(DEMO_DIALOGUES);

      this.activeDialogue = "";
      this.lineIndex = -1;

      this.relationships = {};
      this.hints = {};
    }

    cloneWords(source) {
      return JSON.parse(JSON.stringify(source));
    }

    cloneDialogues(source) {
      return JSON.parse(JSON.stringify(source));
    }

    normalizeWord(word) {
      return String(word ?? "")
        .trim()
        .toLowerCase()
        .replace(/[.,!?;:()[\]{}"']/g, "");
    }

    getInfo() {
      return {
        id: "wonderlingdialogue",
        name: "Wonderling Engine",
        color1: "#7C5CFC",
        color2: "#6246C7",
        color3: "#4A3498",

        blocks: [
          {
            opcode: "reset",
            blockType: Scratch.BlockType.COMMAND,
            text: "Wonderling zurücksetzen"
          },
          {
            opcode: "startDialog",
            blockType: Scratch.BlockType.COMMAND,
            text: "Dialog starten [ID]",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "intro"
              }
            }
          },
          {
            opcode: "nextLine",
            blockType: Scratch.BlockType.COMMAND,
            text: "nächste Dialogzeile"
          },
          {
            opcode: "dialogActive",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "Dialog ist aktiv?"
          },
          {
            opcode: "currentSpeaker",
            blockType: Scratch.BlockType.REPORTER,
            text: "aktueller Sprecher"
          },
          {
            opcode: "currentFantasy",
            blockType: Scratch.BlockType.REPORTER,
            text: "aktuelle Fantasiesprache"
          },
          {
            opcode: "currentTranslation",
            blockType: Scratch.BlockType.REPORTER,
            text: "aktuelle Übersetzung"
          },
          {
            opcode: "currentEmotion",
            blockType: Scratch.BlockType.REPORTER,
            text: "aktuelle Emotion"
          },
          {
            opcode: "lineNumber",
            blockType: Scratch.BlockType.REPORTER,
            text: "aktuelle Zeilennummer"
          },
          {
            opcode: "lineCount",
            blockType: Scratch.BlockType.REPORTER,
            text: "Anzahl Dialogzeilen"
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
          },
          {
            opcode: "learnWord",
            blockType: Scratch.BlockType.COMMAND,
            text: "Wort [WORD] um [AMOUNT]% lernen",
            arguments: {
              WORD: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "luma"
              },
              AMOUNT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 25
              }
            }
          },
          {
            opcode: "setWordProgress",
            blockType: Scratch.BlockType.COMMAND,
            text: "Wort [WORD] auf [AMOUNT]% setzen",
            arguments: {
              WORD: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "luma"
              },
              AMOUNT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 100
              }
            }
          },
          {
            opcode: "wordKnown",
            blockType: Scratch.BlockType.BOOLEAN,
            text: "Wort [WORD] ist gelernt?",
            arguments: {
              WORD: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "luma"
              }
            }
          },
          {
            opcode: "wordMeaning",
            blockType: Scratch.BlockType.REPORTER,
            text: "Bedeutung von [WORD]",
            arguments: {
              WORD: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "luma"
              }
            }
          },
          {
            opcode: "knownWords",
            blockType: Scratch.BlockType.REPORTER,
            text: "Anzahl gelernter Wörter"
          },
          {
            opcode: "addHint",
            blockType: Scratch.BlockType.COMMAND,
            text: "Hinweis zu [WORD] geben",
            arguments: {
              WORD: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "luma"
              }
            }
          },
          {
            opcode: "hintCount",
            blockType: Scratch.BlockType.REPORTER,
            text: "Hinweise für [WORD]",
            arguments: {
              WORD: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "luma"
              }
            }
          },
          {
            opcode: "setRelationship",
            blockType: Scratch.BlockType.COMMAND,
            text: "Beziehung zu [NPC] auf [VALUE]",
            arguments: {
              NPC: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Mira"
              },
              VALUE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 25
              }
            }
          },
          {
            opcode: "changeRelationship",
            blockType: Scratch.BlockType.COMMAND,
            text: "Beziehung zu [NPC] um [VALUE] ändern",
            arguments: {
              NPC: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Mira"
              },
              VALUE: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 5
              }
            }
          },
          {
            opcode: "getRelationship",
            blockType: Scratch.BlockType.REPORTER,
            text: "Beziehung zu [NPC]",
            arguments: {
              NPC: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Mira"
              }
            }
          },
          {
            opcode: "getKnownText",
            blockType: Scratch.BlockType.REPORTER,
            text: "bekannte Wörter aus [TEXT]",
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Neko luma tava"
              }
            }
          },
          {
            opcode: "getTranslatedText",
            blockType: Scratch.BlockType.REPORTER,
            text: "Übersetze bekannte Wörter in [TEXT]",
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "Neko luma tava"
              }
            }
          },
          {
            opcode: "exportState",
            blockType: Scratch.BlockType.REPORTER,
            text: "Wonderling-Spielstand exportieren"
          },
          {
            opcode: "importState",
            blockType: Scratch.BlockType.COMMAND,
            text: "Wonderling-Spielstand importieren [DATA]",
            arguments: {
              DATA: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "{}"
              }
            }
          }
        ]
      };
    }

    reset() {
      this.words = this.cloneWords(DEMO_WORDS);
      this.dialogues = this.cloneDialogues(DEMO_DIALOGUES);
      this.activeDialogue = "";
      this.lineIndex = -1;
      this.relationships = {};
      this.hints = {};
    }

    startDialog(args) {
      const id = String(args.ID ?? "").trim();
      const dialogue = this.dialogues[id];

      if (!dialogue) {
        this.activeDialogue = "";
        this.lineIndex = -1;
        return;
      }

      this.activeDialogue = id;
      this.lineIndex = 0;
    }

    nextLine() {
      if (!this.activeDialogue) return;

      const dialogue = this.dialogues[this.activeDialogue];
      if (!dialogue || !Array.isArray(dialogue.lines)) {
        this.activeDialogue = "";
        this.lineIndex = -1;
        return;
      }

      if (this.lineIndex < dialogue.lines.length - 1) {
        this.lineIndex += 1;
      } else {
        this.activeDialogue = "";
        this.lineIndex = -1;
      }
    }

    getCurrentLine() {
      if (!this.activeDialogue) return null;

      const dialogue = this.dialogues[this.activeDialogue];
      if (!dialogue || !dialogue.lines[this.lineIndex]) return null;

      return dialogue.lines[this.lineIndex];
    }

    dialogActive() {
      return this.getCurrentLine() !== null;
    }

    currentSpeaker() {
      if (!this.activeDialogue) return "";
      return this.dialogues[this.activeDialogue]?.speaker ?? "";
    }

    currentFantasy() {
      return this.getCurrentLine()?.fantasy ?? "";
    }

    currentTranslation() {
      return this.getTranslatedText({
        TEXT: this.getCurrentLine()?.fantasy ?? ""
      });
    }

    currentEmotion() {
      return this.getCurrentLine()?.emotion ?? "";
    }

    lineNumber() {
      return this.dialogActive() ? this.lineIndex + 1 : 0;
    }

    lineCount() {
      if (!this.activeDialogue) return 0;
      return this.dialogues[this.activeDialogue]?.lines?.length ?? 0;
    }

    ensureWord(word) {
      const key = this.normalizeWord(word);
      if (!key) return null;

      if (!this.words[key]) {
        this.words[key] = {
          meaning: "",
          category: "unbekannt",
          confidence: 0
        };
      }

      return this.words[key];
    }

    translationProgress(args) {
      const key = this.normalizeWord(args.WORD);
      return this.words[key]?.confidence ?? 0;
    }

    learnWord(args) {
      const key = this.normalizeWord(args.WORD);
      const amount = Number(args.AMOUNT);

      if (!key || !Number.isFinite(amount)) return;

      const entry = this.ensureWord(key);
      entry.confidence = Math.max(
        0,
        Math.min(100, entry.confidence + amount)
      );
    }

    setWordProgress(args) {
      const key = this.normalizeWord(args.WORD);
      const amount = Number(args.AMOUNT);

      if (!key || !Number.isFinite(amount)) return;

      const entry = this.ensureWord(key);
      entry.confidence = Math.max(0, Math.min(100, amount));
    }

    wordKnown(args) {
      const key = this.normalizeWord(args.WORD);
      return (this.words[key]?.confidence ?? 0) >= 100;
    }

    wordMeaning(args) {
      const key = this.normalizeWord(args.WORD);
      const entry = this.words[key];

      if (!entry || entry.confidence <= 0) return "???";
      if (!entry.meaning) return "???";

      return entry.meaning;
    }

    knownWords() {
      return Object.values(this.words)
        .filter(entry => entry.confidence >= 100)
        .length;
    }

    addHint(args) {
      const key = this.normalizeWord(args.WORD);
      if (!key) return;

      this.hints[key] = (this.hints[key] ?? 0) + 1;

      // A hint gives a small amount of progress automatically.
      const entry = this.ensureWord(key);
      entry.confidence = Math.min(100, entry.confidence + 10);
    }

    hintCount(args) {
      const key = this.normalizeWord(args.WORD);
      return this.hints[key] ?? 0;
    }

    clampRelationship(value) {
      return Math.max(-100, Math.min(100, value));
    }

    setRelationship(args) {
      const npc = String(args.NPC ?? "").trim();
      const value = Number(args.VALUE);

      if (!npc || !Number.isFinite(value)) return;

      this.relationships[npc] = this.clampRelationship(value);
    }

    changeRelationship(args) {
      const npc = String(args.NPC ?? "").trim();
      const value = Number(args.VALUE);

      if (!npc || !Number.isFinite(value)) return;

      this.relationships[npc] = this.clampRelationship(
        (this.relationships[npc] ?? 0) + value
      );
    }

    getRelationship(args) {
      const npc = String(args.NPC ?? "").trim();
      return this.relationships[npc] ?? 0;
    }

    getKnownText(args) {
      const text = String(args.TEXT ?? "");
      if (!text.trim()) return "";

      return text
        .split(/\s+/)
        .map(token => {
          const key = this.normalizeWord(token);
          return this.words[key]?.confidence >= 25 ? token : "???";
        })
        .join(" ");
    }

    getTranslatedText(args) {
      const text = String(args.TEXT ?? "");
      if (!text.trim()) return "";

      return text
        .split(/\s+/)
        .map(token => {
          const punctuationMatch = token.match(/^(.+?)([.,!?;:]*)$/);
          const rawWord = punctuationMatch ? punctuationMatch[1] : token;
          const punctuation = punctuationMatch ? punctuationMatch[2] : "";

          const key = this.normalizeWord(rawWord);
          const entry = this.words[key];

          if (!entry || entry.confidence < 50 || !entry.meaning) {
            return token;
          }

          return `${entry.meaning}${punctuation}`;
        })
        .join(" ");
    }

    exportState() {
      return JSON.stringify({
        version: 1,
        words: this.words,
        relationships: this.relationships,
        hints: this.hints,
        activeDialogue: this.activeDialogue,
        lineIndex: this.lineIndex
      });
    }

    importState(args) {
      const raw = String(args.DATA ?? "").trim();
      if (!raw) return;

      try {
        const data = JSON.parse(raw);

        if (data.words && typeof data.words === "object") {
          this.words = data.words;
        }

        if (data.relationships && typeof data.relationships === "object") {
          this.relationships = data.relationships;
        }

        if (data.hints && typeof data.hints === "object") {
          this.hints = data.hints;
        }

        this.activeDialogue =
          typeof data.activeDialogue === "string"
            ? data.activeDialogue
            : "";

        this.lineIndex =
          Number.isInteger(data.lineIndex)
            ? data.lineIndex
            : -1;
      } catch (error) {
        // Invalid save data is ignored instead of crashing the project.
      }
    }
  }

  Scratch.extensions.register(new WonderlingDialogue());
})(Scratch);