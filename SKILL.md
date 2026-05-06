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

**Preferred: inspect existing screens first.** If the target file already contains screens using the same design system, skip `search_design_system` and inspect existing instances directly. A single `use_figma` call that walks an existing frame's instances gives you an exact, authoritative component map:

```js
const frame = figma.currentPage.findOne(n => n.name === "Existing Screen");
const uniqueSets = new Map();
frame.findAll(n => n.type === "INSTANCE").forEach(inst => {
  const mc = inst.mainComponent;
  const cs = mc?.parent?.type === "COMPONENT_SET" ? mc.parent : null;
  const key = cs ? cs.key : mc?.key;
  const name = cs ? cs.name : mc?.name;
  if (key && !uniqueSets.has(key)) {
    uniqueSets.set(key, { name, key, isSet: !!cs, sampleVariant: mc.name });
  }
});
return [...uniqueSets.values()];
```

Only fall back to `search_design_system` when the file has no existing screens to reference. When using it, **search broadly** — try multiple terms and synonyms (e.g., "button", "input", "nav", "card", "accordion", "header", "footer", "tag", "avatar", "toggle", "icon", etc.). Use `includeComponents: true` to focus on components.

**Include component properties** in your map — you need to know which TEXT properties each component exposes for text overrides. Create a temporary instance, read its `componentProperties` (and those of nested instances), then remove the temp instance.

Example component map with property info:

```
Component Map:
- Button → key: "abc123", type: COMPONENT_SET
  Properties: { "Label#2:0": TEXT, "Has Icon#4:64": BOOLEAN }
- PricingCard → key: "ghi789", type: COMPONENT_SET
  Properties: { "Device": VARIANT, "Variant": VARIANT }
  Nested "Text Heading" has: { "Text#2104:5": TEXT }
  Nested "Button" has: { "Label#2:0": TEXT }
```

#### 2b: Discover variables (colors, spacing, radii)

**Inspect existing screens first** (same as components). Or use `search_design_system` with `includeVariables: true`.

> **WARNING: Two different variable discovery methods — do not confuse them.**
>
> - `use_figma` with `figma.variables.getLocalVariableCollectionsAsync()` — returns **only local variables defined in the current file**. If this returns empty, it does **not** mean no variables exist. Remote/published library variables are invisible to this API.
> - `search_design_system` with `includeVariables: true` — searches across **all linked libraries**, including remote and published ones. This is the correct tool for discovering design system variables.
>
> **Never conclude "no variables exist" based solely on `getLocalVariableCollectionsAsync()` returning empty.** Always also run `search_design_system` with `includeVariables: true` to check for library variables before deciding to create your own.

**Query strategy:** `search_design_system` matches against **variable names** (e.g., "Gray/gray-9", "core/gray/100", "space/400"), not categories. Run multiple short, simple queries in parallel rather than one compound query:

- **Primitive colors:** "gray", "red", "blue", "green", "white", "brand"
- **Semantic colors:** "background", "foreground", "border", "surface", "text"
- **Spacing/sizing:** "space", "radius", "gap", "padding"

If initial searches return empty, try shorter fragments or different naming conventions — libraries vary widely ("grey" vs "gray", "spacing" vs "space", "color/bg" vs "background").

#### 2c: Discover styles (text styles, effect styles)

Search for styles using `search_design_system` with `includeStyles: true` and terms like "heading", "body", "shadow", "elevation". Or inspect what an existing screen uses.

Import library styles with `figma.importStyleByKeyAsync(key)`, then apply with `node.textStyleId = style.id` or `node.effectStyleId = style.id`.

### Step 3: Create the Page Wrapper Frame First

**Do NOT build sections as top-level page children and reparent them later** — moving nodes across `use_figma` calls with `appendChild()` silently fails and produces orphaned frames. Instead, create the wrapper first, then build each section directly inside it.

Create the page wrapper in its own `use_figma` call. Position it away from existing content and return its ID:

```js
let maxX = 0;
for (const child of figma.currentPage.children) {
  maxX = Math.max(maxX, child.x + child.width);
}
const wrapper = figma.createAutoLayout("VERTICAL");
wrapper.name = "Homepage";
wrapper.resize(1440, 100);
wrapper.layoutSizingHorizontal = "FIXED";
wrapper.x = maxX + 200;
wrapper.y = 0;
return { success: true, wrapperId: wrapper.id };
```

### Step 4: Build Each Section Inside the Wrapper

**This is the most important step.** Build one section at a time, each in its own `use_figma` call. At the start of each script, fetch the wrapper by ID and append new content directly to it.

After each section, validate with `get_screenshot` before moving on.

#### Override instance text with setProperties()

Component instances ship with placeholder text ("Title", "Heading", "Button"). Use the component property keys you discovered in Step 2 to override them with `setProperties()`.

For nested instances that expose their own TEXT properties, call `setProperties()` on the nested instance:

```js
const nestedHeading = cardInstance.findOne(n => n.type === "INSTANCE" && n.name === "Text Heading");
if (nestedHeading) {
  nestedHeading.setProperties({ "Text#2104:5": "Actual heading from source code" });
}
```

### Step 5: Validate the Full Screen and Transfer Images

After composing all sections, call `get_screenshot` on the full page frame and compare against the source. Fix any issues with targeted `use_figma` calls — don't rebuild the entire screen.

**Screenshot individual sections, not just the full page.** A full-page screenshot at reduced resolution hides text truncation, wrong colors, and placeholder text.

If you ran `generate_figma_design` in parallel (mandatory when the source contains images), transfer captured image hashes to your use_figma output, then delete the capture.

### Step 6: Updating an Existing Screen

1. Use `get_metadata` to inspect the existing screen structure.
2. Identify which sections need updating and which can stay.
3. For each section that needs changes: locate nodes, swap component instances, update text/variants/layout.
4. Validate with `get_screenshot` after each modification.

## Design System — React / Aero (`@birdeye/elemental`)

This project uses **`@birdeye/elemental`** (`file:../../GitHub/elemental`) as its Aero design system component library.

### Import path convention

```ts
import Button       from '@birdeye/elemental/core/atoms/Button';
import Toggle       from '@birdeye/elemental/core/atoms/Toggle';
import FormInput    from '@birdeye/elemental/core/atoms/FormInput';
import TextArea     from '@birdeye/elemental/core/atoms/TextArea';
import SingleSelect from '@birdeye/elemental/core/atoms/SingleSelect';
import Modal        from '@birdeye/elemental/core/atoms/Modal';
import CommonDrawer from '@birdeye/elemental/core/atoms/CommonSideDrawer';
import Tooltip      from '@birdeye/elemental/core/atoms/Tooltip';
import Tag          from '@birdeye/elemental/core/atoms/Tag';
import LoadingShimmer from '@birdeye/elemental/core/atoms/LoadingShimmer';
import NoData       from '@birdeye/elemental/core/components/NoData';
```

Type declarations live in `src/types/elemental.d.ts`.

### Key component patterns

**Button** — `theme`: `primary | secondary | link | super | danger | danger-primary | noBorder`
```tsx
<Button theme="primary"    label="Save"    onClick={handleSave} />
<Button theme="secondary"  label="Cancel"  onClick={handleCancel} />
<Button theme="danger"     label="Delete"  onClick={handleDelete} />
```

**Toggle**
```tsx
<Toggle
  name="featureName"
  checked={isEnabled}
  onChange={(_: unknown, e: { target: { checked: boolean } }) => setEnabled(e.target.checked)}
  className=""
/>
```

**FormInput** — text and checkbox
```tsx
// Text input
<FormInput
  name="fieldName"
  type="text"
  label="Label"
  value={value}
  onChange={(_: unknown, e: React.ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
/>
// Checkbox
<FormInput
  name="fieldName"
  type="checkbox"
  checked={checked}
  label="Checkbox label"
  labelInside={true}
  onChange={(_: unknown, e: React.ChangeEvent<HTMLInputElement>) => setChecked(e.target.checked)}
/>
```

**TextArea**
```tsx
<TextArea
  name="fieldName"
  label="Label"
  value={value}
  onChange={(_: unknown, e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
  rows={4}
  autoSize={false}
/>
```

**SingleSelect**
```tsx
<SingleSelect
  name="fieldName"
  options={[{ value: 24, label: '24 hours' }, { value: 48, label: '48 hours' }]}
  selected={selectedValue}
  onChange={(option: { value: number; label: string }) => setSelected(option.value)}
  displayLabel="Select an option"
/>
```

**Modal**
```tsx
<Modal
  dialogOptions={{
    isOpen: isOpen,
    title: 'Dialog Title',
    showCloseIcon: true,
    onCloseModal: () => setIsOpen(false),
    shouldCloseOnOverlayClick: true,
  }}
  size="small"
>
  {/* content rendered inside the modal body */}
</Modal>
```
Sizes: `extraSmall | small | medium | large | mediumLarge | extraLarge | megaLarge`

**CommonDrawer** (side drawer)
```tsx
<CommonDrawer
  isOpen={isOpen}
  title="Drawer Title"
  onClose={() => setIsOpen(false)}
  width="400px"
  shouldScroll={true}
>
  {/* content rendered inside the drawer */}
</CommonDrawer>
```

### Styling rules

- Elemental components inject their own CSS — do **not** override their internal styles.
- Use SCSS modules only for **structural layout**: page wrapper, section containers, grid columns, separator lines, content-specific preview areas, and timeline/timeline-line styling.
- Do **not** write custom CSS for form controls (inputs, toggles, selects, textareas, checkboxes, buttons) — these are owned by elemental.
- Do **not** introduce new spacing tokens — use the existing `_variables.scss` (`$spacing-*`, `$radius-*`, `$font-size-*`, etc.).
- Do **not** create new SCSS module files unless the component is genuinely new structural content with no elemental equivalent.

## Error Recovery

1. **STOP** on error — do not retry immediately.
2. **Read the error message carefully** to understand what went wrong.
3. Fix the script, then retry.

## Best Practices

- **Always search before building.** The design system likely has the component, variable, or style you need.
- **Prefer design system tokens over hardcoded values.**
- **Prefer component instances over manual builds.**
- **Work section by section.**
- **Return node IDs from every call.**
- **Validate visually after each section.**
- **Match existing conventions.**
