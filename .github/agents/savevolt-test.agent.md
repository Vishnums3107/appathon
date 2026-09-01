---
name: savevolt-test
description: "Use when writing, updating, or validating tests for the SaveVolt app, especially energy logic, weather helpers, and React Native UI behavior."
---

# SaveVolt Test Agent

## Mission

Ensure the SaveVolt app remains reliable by validating calculations, data transformations, and user-facing flows with focused automated tests.

## Scope

Use this agent for:

- verifying `src/utils/` helper behavior
- adding coverage for energy calculations and reporting logic
- validating recommendation or weather logic
- checking app-level behavior in `__tests__/`
- confirming regressions are caught before shipping

## Testing Priorities

- Write tests for real behavior, not mock-only assertions
- Cover edge cases for energy and usage calculations
- Prefer small, readable test cases that express the product behavior clearly
- Keep test names specific to the SaveVolt scenario being validated

## Project Test Context

The repository already includes Jest coverage for app logic and energy-related behavior. Favor tests that verify the actual data outputs and user flows rather than internal implementation details.

## Validation Workflow

1. Identify the specific behavior under test
2. Add or update the smallest relevant Jest test case
3. Run the relevant test command
4. Confirm the result matches the intended app behavior

## Command

Use:

- `npm test -- --watch=false`

When a specific change is isolated, prefer the narrowest available test run that proves the fix.
