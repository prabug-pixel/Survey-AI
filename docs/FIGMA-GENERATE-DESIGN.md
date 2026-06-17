---
name: figma-generate-design
description: "Use this skill alongside figma-use when the task involves translating an application page, view, or multi-section layout into Figma. Triggers: 'write to Figma', 'create in Figma from code', 'push page to Figma', 'take this app/page and build it in Figma', 'create a screen', 'build a landing page in Figma', 'update the Figma screen to match code'. This is the preferred workflow skill whenever the user wants to build or update a full page, screen, or view in Figma from code or a description. Discovers design system components, variables, and styles via search_design_system, imports them, and assembles screens incrementally section-by-section using design system tokens instead of hardcoded values."
disable-model-invocation: false
---

# Build / Update Screens from Design System

Use this skill to create or update full-page screens in Figma by **reusing the published design system** — components, variables, and styles — rather than drawing primitives with hardcoded values. The key insight: the Figma file likely has a published design system with components, color/spacing variables, and text/effect styles that correspond to the codebase's UI components and tokens. Find and use those instead of drawing boxes with hex colors.

**MANDATORY**: You MUST also load [figma-use](../figma-use/SKILL.md) before any `use_figma` call. That skill contains critical rules (color ranges, font loading, etc.) that apply to every script you write.

**Always pass `skillNames: "figma-generate-design"` when calling `use_figma` as part of this skill.** This is a logging parameter — it does not affect execution.

## Skill Boundaries

- Use this skill when the deliverable is a **Figma screen** (new or updated) composed of design system component instances.
- If the user wants to generate **code from a Figma design**, switch to [figma-implement-design](../figma-implement-design/SKILL.md).
- If the user wants to create **new reusable components or variants**, use [figma-use](../figma-use/SKILL.md) directly.
- If the user wants to write **Code Connect mappings**, switch to [figma-code-connect](../figma-code-connect/SKILL.md).

## Prerequisites

- Figma MCP server must be connected
- The target Figma file must have a published design system with components (or access to a team library)
- User should provide either:
  - A Figma file URL / file key to work in
  - Or context about which file to target (the agent can discover pages)
- Source code or description of the screen to build/update

## Parallel Workflow with generate_figma_design (Web Apps Only)

When building a screen from a **web app** that can be rendered in a browser, the best results come from running both approaches in parallel:

1. **In parallel:**
   - Start building the screen using this skill's workflow (use_figma + design system components)
   - Run `generate_figma_design` to capture a pixel-perfect screenshot of the running web app
2. **Once both complete:** Update the use_figma output to match the pixel-perfect layout from the `generate_figma_design` capture. The capture provides the exact spacing, sizing, and visual treatment to aim for, while your use_figma output has proper component instances linked to the design system. If the capture contains images, transfer them to your use_figma output by copying `imageHash` values from the capture's image fills (see Step 5 for details).
3. **Once confirmed looking good:** Delete the `generate_figma_design` output — it was only used as a visual reference.

This combines the best of both: `generate_figma_design` gives pixel-perfect layout accuracy, while use_figma gives proper design system component instances that stay linked and updatable.

**This parallel workflow is MANDATORY when the source contains images.** The `use_figma` Plugin API cannot fetch external image URLs — it can only set image fills by copying `imageHash` values from nodes already in the file. `generate_figma_design` rasterizes all visible images into Figma, providing the hashes you need. If you skip the capture when images are present, image frames will be left blank.

For non-web apps (iOS, Android, etc.) or when updating existing screens, use the standard workflow below.

## Required Workflow

**Follow these steps in order. Do not skip steps.**

### Step 1: Understand the Screen

Before touching Figma, understand what you're building:

1. If building from code, read the relevant source files to understand the page structure, sections, and which components are used.
2. Identify the major sections of the screen (e.g., Header, Hero, Content Panels, Pricing Grid, FAQ Accordion, Footer).
3. For each section, list the UI components involved (buttons, inputs, cards, navigation pills, accordions, etc.).
4. **Check whether the screen contains any images** (e.g., `<img>`, `<Image>`, background images, product photos, avatars, icons loaded from URLs). If it does and this is a web app, you **must** run the parallel `generate_figma_design` capture workflow — start it immediately alongside Step 2 so the capture runs while you discover components. See "Parallel Workflow with generate_figma_design" above.

### Step 2: Discover Design System — Components, Variables, and Styles

You need three things from the design system: **components** (buttons, cards, etc.), **variables** (colors, spacing, radii), and **styles** (text styles, effect styles like shadows). Don't hardcode hex colors or pixel values when design system tokens exist.

#### 2a: Discover components

**Preferred: inspect existing screens first.** If the target file already contains screens using the same design system, skip `search_design_system` and inspect existing instances directly. A single `use_figma` call that walks an existing frame's instances gives you an exact, authoritative component map.

Only fall back to `search_design_system` when the file has no existing screens to reference. When using it, **search broadly** — try multiple terms and synonyms.

**Include component properties** in your map — you need to know which TEXT properties each component exposes for text overrides.

#### 2b: Discover variables (colors, spacing, radii)

**Inspect existing screens first** (same as components). Or use `search_design_system` with `includeVariables: true`.

> **WARNING: Two different variable discovery methods — do not confuse them.**
>
> - `use_figma` with `figma.variables.getLocalVariableCollectionsAsync()` — returns **only local variables defined in the current file**.
> - `search_design_system` with `includeVariables: true` — searches across **all linked libraries**.

#### 2c: Discover styles (text styles, effect styles)

Search for styles using `search_design_system` with `includeStyles: true` and terms like "heading", "body", "shadow", "elevation".

### Step 3: Create the Page Wrapper Frame First

**Do NOT build sections as top-level page children and reparent them later** — moving nodes across `use_figma` calls with `appendChild()` silently fails and produces orphaned frames. Instead, create the wrapper first, then build each section directly inside it.

### Step 4: Build Each Section Inside the Wrapper

**This is the most important step.** Build one section at a time, each in its own `use_figma` call.

**Never hardcode hex colors or pixel spacing** when a design system variable exists. Use `setBoundVariable` for spacing/radii and `setBoundVariableForPaint` for colors. Apply text styles with `node.textStyleId` and effect styles with `node.effectStyleId`.

### Step 5: Validate the Full Screen and Transfer Images

After composing all sections, call `get_screenshot` on the full page frame and compare against the source. Fix any issues with targeted `use_figma` calls — don't rebuild the entire screen.

**Screenshot individual sections, not just the full page.**

### Step 6: Updating an Existing Screen

When updating rather than creating from scratch:

1. Use `get_metadata` to inspect the existing screen structure.
2. Identify which sections need updating and which can stay.
3. For each section that needs changes, locate the existing nodes by ID or name; swap component instances if the design system component changed.
4. Validate with `get_screenshot` after each modification.

## Best Practices

- **Always search before building.** The design system likely has the component, variable, or style you need.
- **Search broadly.** Try synonyms and partial terms.
- **Prefer design system tokens over hardcoded values.**
- **Prefer component instances over manual builds.**
- **Work section by section.** Never build more than one major section per `use_figma` call.
- **Return node IDs from every call.**
- **Validate visually after each section.**
- **Match existing conventions.** If the file already has screens, match their naming, sizing, and layout patterns.
