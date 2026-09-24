# Codex Working Rules

## Main rule

Use minimal tokens. Do not explain everything unless asked. Make small, safe changes only.

## Project context

* Read `PROJECT_CONTEXT.md` when a task depends on product direction, architecture, accessibility, game scope, monetisation, or roadmap decisions.
* Treat `PROJECT_CONTEXT.md` as the current product source of truth.
* Do not duplicate large sections of project context in responses.
* Do not revive old MVP assumptions that conflict with `PROJECT_CONTEXT.md`.

## Before editing

1. Read this file first.
2. Read only the relevant parts of `PROJECT_CONTEXT.md` when needed.
3. Inspect only the files needed for the task.
4. Do not scan the whole repo unless necessary.
5. Ask only if genuinely blocked.

## Response style

* Be brief.
* Give the result first.
* No long theory.
* No big option lists unless requested.
* Mention only changed files and key reasons.
* Do not repeat project context already documented elsewhere.

## Coding rules

* Do not rewrite whole files unless necessary.
* Prefer small patches.
* Preserve working behaviour unless the task explicitly changes it.
* Keep existing project conventions unless the task introduces a shared replacement.
* Do not change unrelated files.
* Do not generate binaries or image assets unless explicitly requested.
* Do not edit lockfiles unless dependencies changed.
* Do not invent features beyond the prompt or `PROJECT_CONTEXT.md`.
* Avoid unnecessary dependencies.
* Keep game logic separate from presentation where practical.
* Prefer shared components only when they genuinely reduce duplication.
* Accessibility requirements are product requirements, not optional polish.

## ZenPlay guardrails

Unless explicitly requested otherwise:

* No ads
* No tracking
* No accounts
* No dark patterns
* No unnecessary backend
* No paywalling accessibility
* No mandatory drag-only interactions
* No manipulative engagement mechanics
* No excessive animation
* No hidden primary controls
* No unrelated game implementations during another milestone

Preserve ZenPlay's goals of:

* familiar interaction
* large readable controls
* predictable navigation
* calm presentation
* offline-friendly behaviour
* tap-first interaction
* privacy

## Workflow

For each task:

1. Restate the exact target in one sentence.
2. Inspect only what is required.
3. Make the smallest complete change.
4. Run the requested relevant verification.
5. Summarise changed files and key behaviour.
6. Mention intentional deviations only if any.
7. Suggest one next step only.

## Verification

Prefer existing project scripts.

Common checks:

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

Run only the checks appropriate to the task unless the prompt explicitly requires all of them.

Do not invent successful verification. If a check cannot be run or fails, report it clearly.

## Token-saving rules

Assume every response should be compact.

Avoid:

* repeating the prompt
* repeating project context
* lengthy explanations of straightforward changes
* scanning unrelated files
* large speculative improvement lists

Use the repository documentation instead of restating it.
