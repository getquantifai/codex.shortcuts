const keycode = require('keycode');

/**
 * @example
 * new Shortcut({
 *   name : 'CMD+S',
 *   on : document.body,
 *   callback : function(event) {
 *       // handle CMD+S
 *   }
 * });
 */

/**
 * @typedef {ShortcutConfig} ShortcutConfig
 * @property {String} name - shortcut name
 * @property {Element} on - element that passed on shortcut creation
 * @property {Function} callback - custom user function
 */

/**
 * @class Shortcut
 * @classdesc Callback will be fired with two params:
 *   - event: standard keyDown param
 *   - target: element which registered on shortcut creation
 */
class Shortcut {
  /**
   * @return {{SHIFT: string[], CMD: string[], ALT: string[]}}
   */
  static get supportedCommands() {
    return {
      SHIFT: ['SHIFT'],
      CMD: ['CMD', 'CONTROL', 'COMMAND', 'WINDOWS', 'CTRL'],
      ALT: ['ALT', 'OPTION'],
    };
  }

  /**
   * @constructor
   *
   * Create new shortcut
   * @param {ShortcutConfig} shortcut
   */
  constructor(shortcut) {
    this.commands = {};
    this.keys = {};
    this.name = shortcut.name;

    this.parseShortcutName(shortcut.name);

    this.element = shortcut.on;
    this.callback = shortcut.callback;

    this.executeShortcut = (event) => {
      this.execute(event);
    };
    this.element.addEventListener('keydown', this.executeShortcut, false);
  }

  /**
   * Parses string to get shortcut commands in uppercase
   * @param {String} shortcut
   */
  parseShortcutName(shortcut) {
    shortcut = shortcut.split('+');
    for (let key = 0; key < shortcut.length; key++) {
      shortcut[key] = shortcut[key].toUpperCase();

      let isCommand = false;

      for (let command in Shortcut.supportedCommands) {
        if (Shortcut.supportedCommands[command].includes(shortcut[key])) {
          this.commands[command] = true;
          isCommand = true;
          break;
        }
      }

      if (!isCommand) {
        this.keys[shortcut[key]] = true;
      }
    }

    for (let command in Shortcut.supportedCommands) {
      if (!this.commands[command]) {
        this.commands[command] = false;
      }
    }
  }

  /**
   * Check all passed commands and keys before firing callback
   * @param event
   */
  execute(event) {
    let cmdKey = event.ctrlKey || event.metaKey,
      shiftKey = event.shiftKey,
      altKey = event.altKey,
      passed = {
        CMD: cmdKey,
        SHIFT: shiftKey,
        ALT: altKey,
      };

    let command,
      allCommandsPassed = true;

    for (command in this.commands) {
      if (this.commands[command] !== passed[command]) {
        allCommandsPassed = false;
      }
    }
    let key,
      allKeysPassed = true;

    for (key in this.keys) {
      allKeysPassed = allKeysPassed && event.keyCode === keycode(key);
    }

    if (allCommandsPassed && allKeysPassed) {
      this.callback(event);
    }
  }

  /**
   * Destroy shortcut: remove listener from element
   */
  remove() {
    this.element.removeEventListener('keydown', this.executeShortcut);
  }
}

export default Shortcut;
