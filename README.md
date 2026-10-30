# Playwright Automation – Screening Task

[![Playwright Tests](https://github.com/nishaka03/playwright-screening/actions/workflows/playwright.yml/badge.svg)](https://github.com/nishaka03/playwright-screening/actions/workflows/playwright.yml)

End-to-end tests written with **Playwright Test + TypeScript** against:

- **playwright.dev** – the Playwright docs site
- **demo.playwright.dev/todomvc** – the TodoMVC demo app

## Requirements

- Node.js 20 or newer
- npm

## Install

```bash
npm ci
npx playwright install --with-deps chromium
```

## Run the tests

| What | Command |
|---|---|
| All tests | `npx playwright test` |
| Docs site only | `npx playwright test --project=docs` |
| TodoMVC only | `npx playwright test --project=todomvc` |
| Watch the browser | `npx playwright test --headed` |
| Interactive UI mode | `npx playwright test --ui` |
| Debug step by step | `npx playwright test --debug` |

## Report and trace

```bash
npx playwright show-report
```

- The **HTML report** is written to `playwright-report/` after every run.
- A **trace** is recorded on the first retry of a failing test (`trace: 'on-first-retry'`). Open it from the report, or with `npx playwright show-trace <path-to-trace.zip>`.
- Retries are set to **1 locally and 2 on CI**. A trace is only recorded when a test is retried, so with the default of 0 retries it would never be created locally.
- A screenshot is saved for every failed test.

## Project structure

```
.
├── .github/workflows/playwright.yml   # CI: runs the tests on every push / PR
├── pages/
│   └── TodoPage.ts                    # Page Object for the TodoMVC app
├── tests/
│   ├── docs.spec.ts                   # Part 1 – playwright.dev
│   └── todomvc.spec.ts                # Part 2 + bonus data-driven tests
└── playwright.config.ts
```

## What is covered

**Part 1 – playwright.dev** (`tests/docs.spec.ts`)

1. Home page title contains "Playwright"
2. "Get started" navigates to `/docs/intro`
3. The "Installation" heading is visible
4. Searching for "locators" shows results

**Part 2 – TodoMVC** (`tests/todomvc.spec.ts`)

1. Adding 3 todos shows 3 items
2. Completing one shows "2 items left"
3. Active and Completed filters show the correct items
4. Editing a todo by double-click updates its text
5. Deleting a todo removes it
6. "Clear completed" removes only the completed todos

**Bonus**

- **Data-driven test:** an array of inputs (plain text, unicode/emoji, long text, text with surrounding spaces) generates one test per input.
- **GitHub Actions:** `.github/workflows/playwright.yml` installs Chromium, runs every test and uploads the HTML report as a build artifact.

## Design decisions

- **User-facing locators only.** Every element is found with `getByRole`, `getByPlaceholder` or `getByText`, the way a user or screen reader would find it. There is no XPath or CSS, so the tests don't break when markup or styling changes.
- **No hard waits.** There is no `waitForTimeout`. Playwright's actions auto-wait for elements to be ready, and web-first assertions (`await expect(...)`) retry until they pass or time out. This also covers the docs search, whose results load over the network.
- **Page Object for TodoMVC.** `TodoPage` holds the locators and user actions, so tests read as plain steps and a UI change only needs fixing in one place. It contains no assertions; all checks live in the tests.
- **Todo item locator.** `getByRole('listitem')` alone would also match the All / Active / Completed filter links, which are list items too. The locator keeps only list items that contain a "Toggle Todo" checkbox.
- **Editing.** In edit mode the app hides the todo's text and shows an input. Only one todo can be edited at a time, so the "Edit" textbox is located on the page rather than inside the item.
- **`beforeEach` for setup.** The outer hook opens the app; a nested `describe` adds three todos for the tests that need them. Each test gets a fresh browser context, so tests are independent and can run in parallel.
- **One project per site.** Each site has its own `baseURL`, so the config defines a `docs` and a `todomvc` project, both on Desktop Chrome (Chromium). `testMatch` maps each spec file to its project.
- **Trailing slash on the TodoMVC `baseURL`.** It is `https://demo.playwright.dev/todomvc/` and the page object navigates to `./`. Navigating to `/` would drop the `/todomvc` path.
