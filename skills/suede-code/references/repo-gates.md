# Repo gates by stack

Read from `SKILL.md` "Run the repo's own gates first" once the stack is known. Detect what the repo ships and run only that; the severity mapping and house-rules rule stay in `SKILL.md`.

| Stack | Type check | Lint | Test | Other |
|---|---|---|---|---|
| Web / Node | `npx tsc --noEmit` | `npm run lint` (changed files) | `npm test` | `npm audit` when deps changed |
| MCP server (Node) | `node --check <server>.mjs` | configured linter | repo MCP tests | One stdio session: `initialize`, `notifications/initialized`, then list/call/read/get |
| iOS / Swift | the build is the check | SwiftLint if configured | XCTest target | `xcodebuild -scheme X -destination 'platform=iOS Simulator,name=<device>' build` |
| API / backend | compile step if any | configured linter | contract or schema tests | OpenAPI validation against the live route |
