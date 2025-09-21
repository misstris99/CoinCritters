## Repo snapshot and purpose

This is a small Flask-based project (single Flask app in `app.py`) that currently serves a single route (`/`). The `templates/` directory holds `home.html` but also contains a Python file (`templates/backend.py`) that appears to be a CLI snippet and is not imported by the app. Use this file to guide quick, low-risk edits: add routes to `app.py`, add Jinja templates under `templates/`, and update `requirements.txt` when adding libs.

## Entry points & how to run locally

- Primary app entry: `app.py` (starts Flask with `app.run(debug=True)`).
- To run locally (recommended): create a venv, install requirements, then either `python app.py` or set `FLASK_APP=app.py` and `flask run --debug`.
- Dependencies are pinned in `requirements.txt` (Flask 3.x present).

## Architectural notes (big picture)

- Very small, monolithic Flask app — no blueprints, no DB, no external APIs discovered in repo.
- Templates follow Jinja2 conventions in `templates/`. Currently `home.html` is a static welcome page.
- `templates/backend.py` looks misplaced: it contains a CLI input snippet (`Total_amount = float(input(...))`) and is not imported. Before editing or removing it, search the repo for imports/usages.

## Project-specific conventions & patterns

- Keep Flask routes in `app.py` unless you introduce a package structure. If you split into modules, update imports and add an **init**.py to make a package.
- Template files must live in `templates/` and be referenced via `render_template('home.html')` from `app.py`.
- When adding a new Python dependency, append it to `requirements.txt` with a pinned version.

## Common tasks examples (for AI agents)

- Add a new route that renders the existing template:

  app.py -> add: from flask import render_template
  then: @app.route('/home')\n def home():\n return render_template('home.html')

- If you modify `templates/backend.py`, confirm whether it's meant to be moved to the project root (or a `scripts/` folder) — do not assume it's part of the Flask app until an import/reference is found.

## Debugging & development tips

- Use the existing debug mode in `app.py` for quick iterations (app.run(debug=True)). For CLI testing, run `python app.py` directly.
- There are no tests or linters in the repo. Run code locally after edits and check for syntax errors.

## Integration & safety checks for PRs

- Before opening a PR, ensure:
  - requirements.txt updated for any new dependency
  - Templates are valid Jinja (no stray Python code in `.html` files)
  - No accidental inclusion of the CLI snippet in `templates/` into the template assets

## Files to inspect when changing behavior

- `app.py` — main Flask app and routes
- `templates/home.html` — example Jinja template used for UI
- `templates/backend.py` — likely misplaced CLI code (verify usage before deletion)
- `requirements.txt` — add/pin dependencies
- `README.md` — contains project description; update when adding features

If anything above is unclear or you want the instructions to be stricter (for example stricter commit messages or a preferred branching strategy), tell me how strict to be and I'll iterate.
