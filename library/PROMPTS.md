# PROMPTS – Section 2: Library

Tool: Claude Code (Opus 5.5)

## Part 2: CRUD methods
I wrote the CRUD methods in custom_classes.py myself, step by step.
Only main.py (the demo of every method and exception) was generated with this prompt:
"Rewrite main.py only. Do NOT change custom_classes.py. Demonstrate every method,
and trigger each exception once with try/except."

Note: the AI accidentally ran "fix typecheck errors" (a suggested prompt) and added two
type hints (`self.id: int | None`, `checkout() -> str`). They don't change behavior, so I kept them.

## Part 3: REST API
Prompt: create app.py with all 8 endpoints, seeded data, port 5001.
Routes only translate HTTP to method calls; exceptions are mapped with Flask error handlers:
ItemNotFoundError → 404, ItemStateError → 409, ValueError/TypeError → 400.
I tested every endpoint with curl (success and error cases).

Decision: the assignment uses `duration`, so I renamed `duration_minutes` (from the Week 3 review)
back to `duration` and kept "in minutes" in the docstring.

## Part 4: Frontend
Part 1 (Figma, bonus) was skipped, so I gave the AI a written layout instead:
error area, add/edit form with a field that switches between page count and duration,
filters (Available only, All/Book/DVD), item cards with Checkout/Return, edit and delete,
and an empty state. Rules: all data and rules come from the API, no filtering or validation
in JavaScript, reload the list after every action, handle 201 and 204 correctly.

## Things the AI got wrong and I fixed
1. **Delete had no confirmation.** One click deleted an item permanently.
   Fix: added a confirm() dialog before the DELETE request.
2. **Validation was duplicated in the frontend.** The AI said validation is left to the API,
   but it added HTML rules to the number input. For 12.4, the browser showed its own popup and
   the request never reached the API, so errors appeared in two different places.
   Fix: removed the HTML validation; the API's 400 message now shows in the error area.
3. The AI did not test the page in a browser; it only tested the API.
   I tested the page myself (checkout message, 409 on deleting a checked-out item,
   400 on empty title, filters, empty state, cancel edit, deleting an item while editing it).