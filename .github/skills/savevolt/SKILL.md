---
name: savevolt
description: "Use when working on the SaveVolt React Native energy app: adding screens, APIs, recommendations, analytics, or testing; updating energy calculations, smart-home logic, navigation, or user-facing features; validating app behavior with Jest and React Native conventions."
---

# SaveVolt Project Skill

## Purpose

This repository contains the SaveVolt mobile application: a React Native + TypeScript app focused on energy awareness, smart home insights, recommendations, community challenges, and sustainable usage patterns.

Use this skill when making project changes in the app, especially around the energy dashboard, usage analytics, recommendations, reminders, voice features, notifications, blockchain/demo components, and user flows.

## Project Layout

- `App.tsx` — app entry point and top-level composition
- `src/screens/` — primary screens such as Dashboard, Recommendations, Trends, Progress, Energy Audit, and Settings
- `src/context/` — application state and context providers
- `src/services/` — AI, weather, sync, notifications, smart home, blockchain, and voice logic
- `src/utils/` — reusable helper functions for energy, tips, voice, and weather behavior
- `src/theme/` — design tokens and styling configuration
- `src/navigation/` — screen navigation and route structure
- `__tests__/` — Jest coverage for app logic and energy workflows

## Core Working Rules

1. Keep changes aligned with the existing app architecture.
   - Prefer screen logic in `src/screens/`
   - Keep shared or reusable logic in `src/utils/` or `src/services/`
   - Store shared app state in `src/context/`

2. Respect the React Native + TypeScript setup.
   - Preserve TypeScript typing where present
   - Favor small, focused functions and readable component structure
   - Avoid introducing untyped `any` values unless strictly necessary and clearly justified

3. Preserve app behavior during feature work.
   - Do not break navigation flows or screen rendering assumptions
   - Keep feature flags and demo data paths realistic for a product prototype
   - Maintain consistent naming around energy, recommendations, weather, and reporting features

4. Validate the right layer.
   - For logic or utilities: prefer targeted Jest tests in `__tests__/`
   - For UI and navigation changes: verify screen-level behavior and ensure imports remain valid
   - Run the relevant test command and confirm the change fixes the intended behavior

## Feature Areas to Understand

- Energy usage and audit flows
- Recommendations and AI-driven suggestions
- Dashboard and impact visualizations
- Weather and environmental context integration
- Reminders, notifications, and smart-home behaviors
- User challenge and community engagement flows
- Voice command and assistant-related logic

## Preferred Workflow

- Start by identifying the exact feature area and file boundaries
- Keep the fix or feature scoped to the smallest possible set of files
- Match existing naming conventions and patterns already used in the repo
- Add or update tests whenever a behavior changes or a new utility is introduced
- Validate with the smallest relevant Jest run before considering the task complete

## Validation Commands

Use the project scripts when checking changes:

- `npm test -- --watch=false`
- `npm run lint`

Prefer the leanest verification command that proves the behavior change.

## Quality Bar

Before finalizing any SaveVolt work:

- code remains consistent with the repo’s React Native patterns
- imports and files are valid and resolve cleanly
- broken navigation or state transitions are avoided
- tests or verification cover the changed behavior
- the change is scoped to the feature area being edited

## Typical Modification Patterns

- Screen updates: add or adjust UI, props, and state handling in `src/screens/`
- Context updates: keep provider values predictable and serializable where possible
- Service logic: isolate external integrations and keep call sites simple
- Utils: create pure or near-pure logic with predictable outputs for easier testing
- Tests: cover corner cases around energy calculations, weather, and recommendation behavior

This skill is intended to keep SaveVolt feature work consistent, maintainable, and grounded in the app's actual architecture.
