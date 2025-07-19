import * as readline from "readline";

export const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask a question and wait for user input
export function askQuestion(
  question: string,
  defaultValue?: string
): Promise<string> {
  return new Promise((resolve) => {
    if (defaultValue) {
      question += ` (default: ${defaultValue})`;
    }

    question += ": ";
    rl.question(question, resolve);
  });
}

// Helper function to ask a question and hides the user input
export function askQuestionWithHiddenInput(
  question: string,
  defaultValue?: string
): Promise<string> {
  return new Promise((resolve) => {
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
    rl.question(question, resolve);
  });
}
