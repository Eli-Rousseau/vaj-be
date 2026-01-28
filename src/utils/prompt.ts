import * as readline from "readline";

/**
 * @description Prompts a question to the console.
 */
export function askQuestion(
  question: string,
  defaultValue?: string
): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (defaultValue) {
      question += ` (default: ${defaultValue})`;
    }

    question += ": ";

    rl.question(question, (answer) => {
      const value =
        answer.trim() === "" && defaultValue ? defaultValue : answer;

      rl.close();
      resolve(value);
    });
  });
}

/**
 * @description Prompts a question to the console by masking the input.
 */
export function askQuestionWithHiddenInput(
  question: string,
  defaultValue?: string
): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const stdin: NodeJS.ReadStream = process.stdin;
    const onData = (char: Buffer) => {
      const key: string = char.toString();
      if (key === "\n" || key === "\r" || key === "\u0004") {
        stdin.off("data", onData);
      } else {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(question + "*".repeat(rl.line.length));
      }
    };
    stdin.on("data", onData);

    if (defaultValue) {
      question += ` (default: ${defaultValue})`;
    }

    question += ": ";
    rl.question(question, (answer) => {
      const value =
        answer.trim() === "" && defaultValue ? defaultValue : answer;

      rl.close();
      resolve(value);
    });
  });
}

/**
 *
 * @description Prompts a list of options to select from.
 */
export function dropDown(question: string, options: string[]): Promise<string> {
  return new Promise((resolve) => {
    let selected = 0;

    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) process.stdin.setRawMode(true);

    process.stdout.write("\x1B[?25l");

    function render(firstRender: boolean = false) {
      const linesToRender = firstRender ? 0 : options.length + 2;

      readline.moveCursor(process.stdout, 0, -linesToRender);
      readline.clearScreenDown(process.stdout);

      console.log(`${question}\n`);
      options.forEach((opt, i) => {
        if (i === selected) {
          console.log(`> \x1b[36m${opt}\x1b[0m`);
        } else {
          console.log(`  ${opt}`);
        }
      });
    }

    render(true);

    const onKeypress = (_: string, key: readline.Key) => {
      if (key.name === "up") {
        selected = (selected - 1 + options.length) % options.length;
        render();
      } else if (key.name === "down") {
        selected = (selected + 1) % options.length;
        render();
      } else if (key.name === "return") {
        process.stdout.write("\x1B[?25h"); // show cursor
        process.stdin.setRawMode(false);
        process.stdin.removeListener("keypress", onKeypress);
        process.stdin.pause(); // stop listening to input
        resolve(options[selected]);
      } else if (key.ctrl && key.name === "c") {
        process.stdout.write("\x1B[?25h");
        process.stdin.setRawMode(false);
        process.stdin.removeListener("keypress", onKeypress);
        process.stdin.pause();
        process.exit(0);
      }
    };

    process.stdin.on("keypress", onKeypress);
  });
}
