# PROMPTS – Section 1: Calculator

Tool: Claude Code (Opus 5.5)

## 1. Main prompt
Built the calculator from design/calculator.png and the Calculator class (custom_classes.py):
static/index.html, style.css, script.js and a Flask app.py with POST /api/calculate.
Rules I gave: all math on the server using the Calculator class, no calculation in JavaScript,
no eval(), 400 errors for invalid input and division by zero, port 5001.

## 2. Problems I found while testing and how I fixed them

1. **Display showed only the current number.** When typing 8 ÷ 0, each key replaced the previous one.
   Fix: asked the AI to show the whole expression while typing.
2. **Chaining was wrong.** 2 + 3 + 4 = gave 7 instead of 9, because the first number was dropped.
   Fix: when an operator is pressed with a pending operation, the pending calculation is sent
   to the server first (math still stays on the server).
3. **Long error messages were cut off.** The CSS had rules that contradicted each other
   (wrap the text, but also keep it on one line and hide overflow).
   Fix: the display now grows and wraps long messages.
4. **No way to clear or delete.** The design has no C button.
   Fix: added keyboard support without changing the design: Escape or clicking the display clears,
   Backspace deletes, digits/operators/Enter work.
5. **Backspace stopped after the current number.** In 51 - 2 it deleted "2" and then did nothing.
   Fix: Backspace now works every time: 51 - 2 → 51 - → 51 → 5 → 0, and the internal state stays in sync.
6. **Design mismatch.** The AI noticed my exported PNG had a different row order than the design.
   Fix: I corrected the Figma file and re-exported calculator.png.

## 3. Decisions
- Operations are evaluated left to right, like a basic 4-function calculator
  (2 + 3 × 4 = 20). Operator precedence was not added because the design has no parentheses.