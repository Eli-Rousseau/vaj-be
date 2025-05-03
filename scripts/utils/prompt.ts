import * as readline from "readline";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper function to ask a question and wait for user input
function askQuestion(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

// Helper function to ask a question and hides the user input
function askQuestionWithHiddenInput(query: string): Promise<string> {
  return new Promise((resolve) => {
    const stdin = process.stdin;
    const onData = (char: Buffer) => {
      const key = char.toString();
      if (key === "\n" || key === "\r" || key === "\u0004") {
        stdin.pause();
      } else {
        process.stdout.clearLine(0);
        process.stdout.cursorTo(0);
        process.stdout.write(query + "*".repeat(rl.line.length));
      }
    };

    stdin.on("data", onData);
    rl.question(query, resolve);
  });
}

export { rl, askQuestion, askQuestionWithHiddenInput };
