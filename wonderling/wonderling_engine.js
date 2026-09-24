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

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("Wonderling Dialog braucht TurboWarp: 'Ohne Sandbox / Unsandboxed'.");
  }

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
      this.lastError = "";
      this.lastEvent = "ready";
      this.ui = null;

      this.buildUI();
      this.installKeyboard();
    }


    buildUI() {
      const canvas = Scratch.vm?.renderer?.canvas;
      const host = canvas?.parentElement;
      if (!host) {
        this.lastError = "TurboWarp-Bühne nicht gefunden.";
        return;
      }

      if (getComputedStyle(host).position === "static") {
        host.style.position = "relative";
      }

      const root = document.createElement("div");
      root.id = "wonderling-dialog-ui";
      Object.assign(root.style, {
        position: "absolute",
        inset: "0",
        zIndex: "99999",
        display: "none",
        pointerEvents: "none",
        fontFamily: "Arial, sans-serif",
        userSelect: "none"
      });

      const panel = document.createElement("div");
      Object.assign(panel.style, {
        position: "absolute",
        left: "5%",
        right: "5%",
        bottom: "4%",
        minHeight: "25%",
        padding: "14px 18px",
        boxSizing: "border-box",
        borderRadius: "18px",
        background: "linear-gradient(180deg, rgba(24,18,47,.97), rgba(9,8,20,.98))",
        border: "2px solid rgba(167,140,255,.75)",
        boxShadow: "0 10px 36px rgba(0,0,0,.45)",
        color: "#fff",
        pointerEvents: "auto",
        overflow: "hidden"
      });

      const header = document.createElement("div");
      Object.assign(header.style, {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px",
        marginBottom: "6px"
      });

      const speaker = document.createElement("div");
      Object.assign(speaker.style, {
        fontWeight: "800",
        fontSize: "clamp(15px, 2.2vw, 24px)"
      });

      const title = document.createElement("div");
      Object.assign(title.style, {
        opacity: ".65",
        fontSize: "clamp(10px, 1.2vw, 14px)"
      });

      header.append(speaker, title);

      const fantasy = document.createElement("div");
      Object.assign(fantasy.style, {
        fontWeight: "700",
        fontSize: "clamp(18px, 2.8vw, 31px)",
        lineHeight: "1.3",
        minHeight: "1.3em",
        wordBreak: "break-word"
      });

      const translation = document.createElement("div");
      Object.assign(translation.style, {
        marginTop: "5px",
        color: "#d8ccff",
        fontSize: "clamp(12px, 1.7vw, 19px)",
        minHeight: "1.4em"
      });

      const gesture = document.createElement("div");
      Object.assign(gesture.style, {
        marginTop: "5px",
        opacity: ".72",
        fontSize: "clamp(10px, 1.3vw, 15px)",
        minHeight: "1.3em"
      });

      const footer = document.createElement("div");
      Object.assign(footer.style, {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap",
        marginTop: "10px"
      });

      const status = document.createElement("div");
      Object.assign(status.style, {
        flex: "1 1 120px",
        opacity: ".7",
        fontSize: "11px"
      });

      const makeButton = (label) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = label;
        Object.assign(b.style, {
          padding: "8px 12px",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,.2)",
          background: "rgba(255,255,255,.08)",
          color: "#fff",
          fontWeight: "700",
          cursor: "pointer"
        });
        return b;
      };

      const hint = makeButton("💡 Hinweis");
      const dictionary = makeButton("📖 Wörterbuch");
      const close = makeButton("Schließen");
      const next = makeButton("Weiter ▶");

      hint.addEventListener("click", () => this.hintCurrentWord());
      dictionary.addEventListener("click", () => this.openDictionary());
      close.addEventListener("click", () => this.closeDialog());
      next.addEventListener("click", () => this.nextLine());

      footer.append(status, hint, dictionary, close, next);
      panel.append(header, fantasy, translation, gesture, footer);
      root.appendChild(panel);
      host.appendChild(root);

      this.ui = { root, title, speaker, fantasy, translation, gesture, status, next };
    }

    updateUI() {
      if (!this.ui?.root) return;

      if (!this.dialogActive()) {
        this.ui.root.style.display = "none";
        return;
      }

      const dialogue = this.dialogues[this.activeDialogue];
      const line = dialogue?.lines?.[this.lineIndex];

      if (!dialogue || !line) {
        this.ui.root.style.display = "none";
        return;
      }

      this.ui.root.style.display = "block";
      this.ui.title.textContent = dialogue.title || this.activeDialogue;
      this.ui.speaker.textContent = dialogue.speaker || "NPC";
      this.ui.fantasy.textContent = line.fantasy || "";
      this.ui.translation.textContent =
        this.getTranslatedText({ TEXT: line.fantasy || "" }) || "???";
      this.ui.gesture.textContent =
        [line.gesture, line.emotion].filter(Boolean).join("  ·  ");

      const total = dialogue.lines.length;
      const focus = this.normalizeWord(line.focusWord || line.focus || "");
      const pct = focus ? (this.words[focus]?.confidence || 0) : 0;

      this.ui.status.textContent =
        "Zeile " + (this.lineIndex + 1) + "/" + total +
        (focus ? " · " + focus + ": " + pct + "%" : "");

      this.ui.next.textContent =
        this.lineIndex >= total - 1 ? "Fertig ✓" : "Weiter ▶";
    }

    installKeyboard() {
      this._keyHandler = (event) => {
        const tag = event.target?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        if (!this.dialogActive()) return;

        if (event.code === "Space" || event.code === "Enter" || event.code === "KeyE") {
          event.preventDefault();
          this.nextLine();
        } else if (event.code === "Escape") {
          event.preventDefault();
          this.closeDialog();
        }
      };
      window.addEventListener("keydown", this._keyHandler);
    }

    hintCurrentWord() {
      const line = this.getCurrentLine();
      const key = this.normalizeWord(line?.focusWord || line?.focus || "");
      if (!key) return;

      const entry = this.words[key];
      if (entry) {
        entry.confidence = Math.min(100, Number(entry.confidence || 0) + 10);
        this.hints[key] = Number(this.hints[key] || 0) + 1;
      }
      this.updateUI();
    }

    openDictionary() {
      const found = Object.entries(this.words)
        .filter(([, v]) => Number(v.confidence || 0) >= 25)
        .sort(([a], [b]) => a.localeCompare(b));

      const text = found.length
        ? found.map(([k, v]) =>
            k + " → " + (Number(v.confidence || 0) >= 50 ? (v.meaning || "???") : "???") +
            " (" + Math.round(Number(v.confidence || 0)) + "%)"
          ).join("\n")
        : "Noch keine Wörter entdeckt.";

      window.alert("WONDERLING WÖRTERBUCH\n\n" + text);
    }

    getCurrentLine() {
      if (!this.activeDialogue) return null;
      return this.dialogues[this.activeDialogue]?.lines?.[this.lineIndex] ?? null;
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
        name: "Wonderling Dialog UI",
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
      this.lastError = "";
      this.lastEvent = "reset";
      this.updateUI();
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
      this.lastError = "";
      this.lastEvent = "dialog-start:" + id;
      this.updateUI();
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
        this.updateUI();
      } else {
        this.activeDialogue = "";
        this.lineIndex = -1;
        this.updateUI();
      }
    }

    getCurrentLine() {
      if (!this.activeDialogue) return null;

      const dialogue = this.dialogues[this.activeDialogue];
      if (!dialogue || !dialogue.lines[this.lineIndex]) return null;

      return dialogue.lines[this.lineIndex];
    }

    dialogActive() {
      return (
        Boolean(this.activeDialogue) &&
        Boolean(this.dialogues[this.activeDialogue]) &&
        this.lineIndex >= 0 &&
        Boolean(this.dialogues[this.activeDialogue].lines[this.lineIndex])
      );
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