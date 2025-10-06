/**
 * Central configuration for the AnKing Prettify card runtime.
 * Adjust the values in this file to tweak behaviour; the shared
 * runtime will read from `window.AnKingConfig` and mirror the legacy
 * global variables for compatibility.
 */
(function configureAnKing() {
  const defaults = {
    autoflip: false,
    timer: {
      minutes: 0,
      seconds: 6,
      timeOverMsg: "<span style='color:#CC5B5B'>!<br/>!<br/>!<br/>!<br/>!<br/>!</span>"
    },
    tags: {
      highlight: "XXXYYYZZZ",
      levelsToShow: 0
    },
    cloze: {
      mode: "cloze",
      hider: (elem) => "[...]",
      selective: false,
      minCount: 0
    },
    shortcuts: {
      toggleTags: "C",
      revealNext: "N",
      revealNextWord: "Shift + N",
      toggleAllCloze: ",",
      toggleNextHint: "H",
      toggleAllHints: "'"
    },
    hints: {
      buttonShortcuts: {
        "Lecture Notes": "Alt+1",
        "Missed Questions": "Alt+2",
        "Pathoma": "Alt+3",
        "Boards and Beyond Links": "",
        "Boards and Beyond": "Alt+4",
        "First Aid Links": "",
        "First Aid": "Alt+5",
        "Sketchy": "Alt+6",
        "Sketchy 2": "",
        "Sketchy Extra": "",
        "Picmonic": "",
        "Pixorize": "Alt+7",
        "Physeo": "Alt+8",
        "Bootcamp": "Alt+F2",
        "OME": "Alt+F1",
        "Additional Resources": "Alt+9"
      },
      autoReveal: {
        "Lecture Notes": true,
        "Missed Questions": true,
        "Pathoma": false,
        "Boards and Beyond": false,
        "Boards and Beyond Links": false,
        "First Aid": false,
        "First Aid Links": false,
        "Sketchy": false,
        "Sketchy 2": false,
        "Sketchy Extra": false,
        "Picmonic": false,
        "Pixorize": false,
        "Physeo": false,
        "Bootcamp": false,
        "OME": false,
        "Additional Resources": false
      },
      scrollToButton: false
    },
    themePalette: {
      light: {
        base: '#10294A',
        accent: '#7FAFFF',
        text: '#152238',
        glow: '#FFFFFF',
        overlay: 'rgba(245, 247, 255, 0.35)'
      },
      dark: {
        base: '#050B16',
        accent: '#7DAFFF',
        text: '#E6EFFF',
        glow: '#2BC1FF',
        overlay: 'rgba(4, 10, 24, 0.55)'
      },
      backgrounds: {
        light: 'starsky.jpeg',
        dark: 'starsky.jpeg'
      }
    }
  };

  const cfg = window.AnKingConfig ? Object.assign({}, defaults, window.AnKingConfig) : defaults;
  cfg.timer = Object.assign({}, defaults.timer, cfg.timer || {});
  cfg.tags = Object.assign({}, defaults.tags, cfg.tags || {});
  cfg.cloze = Object.assign({}, defaults.cloze, cfg.cloze || {});
  cfg.shortcuts = Object.assign({}, defaults.shortcuts, cfg.shortcuts || {});
  cfg.hints = Object.assign({}, defaults.hints, cfg.hints || {});
  cfg.hints.buttonShortcuts = Object.assign({}, defaults.hints.buttonShortcuts, cfg.hints.buttonShortcuts || {});
  cfg.hints.autoReveal = Object.assign({}, defaults.hints.autoReveal, cfg.hints.autoReveal || {});

  window.AnKingConfig = cfg;

  // Maintain legacy globals consumed by the existing card runtime.
  window.autoflip = cfg.autoflip;
  window.minutes = cfg.timer.minutes;
  window.seconds = cfg.timer.seconds;
  window.timeOverMsg = cfg.timer.timeOverMsg;

  window.toggleTagsShortcut = cfg.shortcuts.toggleTags;
  window.revealNextShortcut = cfg.shortcuts.revealNext;
  window.revealNextWordShortcut = cfg.shortcuts.revealNextWord;
  window.toggleAllShortcut = cfg.shortcuts.toggleAllCloze;

  window.ToggleNextButtonShortcut = cfg.shortcuts.toggleNextHint;
  window.ToggleAllButtonsShortcut = cfg.shortcuts.toggleAllHints;

  window.ButtonShortcuts = cfg.hints.buttonShortcuts;
  window.ButtonAutoReveal = cfg.hints.autoReveal;
  window.ScrollToButton = cfg.hints.scrollToButton;

  window.tagID = cfg.tags.highlight;
  window.numTagLevelsToShow = cfg.tags.levelsToShow;

  window.revealNextClozeMode = cfg.cloze.mode;
  window.clozeHider = cfg.cloze.hider;
  window.selectiveOneByOne = cfg.cloze.selective;
  window.minNumberOfClozes = cfg.cloze.minCount;
})();


