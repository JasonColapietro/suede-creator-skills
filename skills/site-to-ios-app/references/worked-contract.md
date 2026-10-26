# Worked delivery contract

This synthetic scenario demonstrates the expected artifact shape; its numbers and outcomes are example inputs, not measured customer results.

## Input

Convert an owned recipe PWA into an iOS app. It has responsive recipe pages and saved favorites; the requested native value is offline saved recipes and share-sheet import. No submission is authorized.

## Expected output

Write SITE_TO_IOS_AUDIT.md with dated inspected routes, auth/payment/privacy behavior and the 4.2 risk. Write SITE_TO_IOS_PLAN.md choosing a bundled or native-shell route from those observations, naming offline storage, share import, error/retry states, build command, simulator target and QA matrix. Keep bundle/signing ownership unresolved until evidence supplies it.

## Failure case

The URL requires a login the agent cannot use. Audit accessible routes and supplied source, list the blocked authenticated flows and request an authorized test path. Do not invent login, account deletion or purchase behavior.

## Validation

Run the chosen build command on the named target; test cold-start deep link, airplane-mode favorites, share import and cancellation. Distinguish a built shell from a reviewed submission package, and retain the 4.2 decision with evidence.
