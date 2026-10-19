const display = document.getElementById("display");

let firstNumber = null;     // number entered before the operator (or the last result)
let operation = null;       // "add" | "subtract" | "multiply" | "divide"
let currentInput = "";      // number currently being typed
let expression = "";        // what the display shows while typing, e.g. "8 ÷ 0"
let showingResult = false;  // true right after "=" shows a result or error
let history = [];           // state saved before each operator, so Backspace can undo it

function show(text) {
    display.textContent = text;
}

function reset() {
    firstNumber = null;
    operation = null;
    currentInput = "";
    expression = "";
    history = [];
}

function saveState() {
    history.push({ firstNumber, operation, currentInput, expression, showingResult });
}

function restoreState() {
    ({ firstNumber, operation, currentInput, expression, showingResult } = history.pop());
}

// Backspace: delete the last character of the expression and keep the state in sync
function backspace() {
    if (currentInput === "" && operation !== null) {
        // Deleting an operator: go back to the state before it was pressed
        restoreState();
    } else {
        if (currentInput === "" && firstNumber !== null) {
            // A result is shown: make it editable like a typed number
            currentInput = String(firstNumber);
            expression = currentInput;
            firstNumber = null;
            showingResult = false;
        }
        // Remove a leftover minus sign together with the last digit (e.g. "-4" -> "")
        const count = /^-\d$/.test(currentInput) ? 2 : 1;
        currentInput = currentInput.slice(0, -count);
        expression = expression.slice(0, -count);
    }
    show(expression || "0");
}

function showError(message) {
    show(message);
    reset();
    showingResult = true;
}

function clearAll() {
    reset();
    showingResult = false;
    show("0");
}

// Sends one calculation to the server. Returns the result, or throws with the error message.
async function calculate(a, b, op) {
    let response, data;
    try {
        response = await fetch("/api/calculate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ a: a, b: b, operation: op }),
        });
        data = await response.json();
    } catch (err) {
        throw new Error("Server error");
    }
    if (!response.ok) throw new Error(data.error);
    return data.result;
}

// Digit and "." buttons: build up the current number as text
document.querySelectorAll(".digit").forEach((button) => {
    button.addEventListener("click", () => {
        const key = button.textContent;

        // Typing a digit after a result starts a fresh calculation
        if (showingResult) {
            reset();
            showingResult = false;
        }

        if (key === "." && currentInput.includes(".")) return;
        const added = currentInput === "" && key === "." ? "0." : key;
        currentInput += added;
        expression += added;
        show(expression);
    });
});

// Operator buttons: remember the first number and the operation
document.querySelectorAll(".operator").forEach((button) => {
    button.addEventListener("click", async () => {
        const symbol = button.textContent;

        if (currentInput !== "") {
            saveState();
            if (operation !== null) {
                // An operation is pending (e.g. "2 + 3"): let the server calculate it first
                try {
                    firstNumber = await calculate(firstNumber, Number(currentInput), operation);
                } catch (err) {
                    showError(err.message);
                    return;
                }
            } else {
                firstNumber = Number(currentInput);
            }
            currentInput = "";
            expression += ` ${symbol} `;
        } else if (firstNumber === null) {
            return;
        } else if (operation !== null) {
            // Two operators in a row: replace the previous one
            expression = expression.slice(0, -3) + ` ${symbol} `;
        } else {
            // Continue from the previous result
            saveState();
            expression = `${firstNumber} ${symbol} `;
        }

        operation = button.dataset.op;
        showingResult = false;
        show(expression);
    });
});

// "=" button: send the numbers to the server and show the answer
document.getElementById("equals").addEventListener("click", async () => {
    if (firstNumber === null || operation === null || currentInput === "") return;

    try {
        const result = await calculate(firstNumber, Number(currentInput), operation);
        reset();
        firstNumber = result;  // next operator continues from here
        expression = String(result);
        showingResult = true;
        show(expression);
    } catch (err) {
        showError(err.message);
    }
});

// Clicking the display clears everything
display.addEventListener("click", clearAll);

// Keyboard support: keys "press" the matching on-screen button
const operatorKeys = { "+": "add", "-": "subtract", "*": "multiply", "/": "divide" };

document.addEventListener("keydown", (event) => {
    // Leave browser shortcuts like Cmd+R or Ctrl+- alone
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    const key = event.key;
    let button = null;

    if ((key >= "0" && key <= "9") || key === ".") {
        button = [...document.querySelectorAll(".digit")].find((b) => b.textContent === key);
    } else if (key in operatorKeys) {
        button = document.querySelector(`.operator[data-op="${operatorKeys[key]}"]`);
    } else if (key === "Enter" || key === "=") {
        button = document.getElementById("equals");
    } else if (key === "Escape") {
        clearAll();
    } else if (key === "Backspace") {
        backspace();
    } else {
        return;
    }

    // Stop the browser's own action (e.g. Enter re-clicking a focused button, "/" quick find)
    event.preventDefault();
    if (button) button.click();
});
