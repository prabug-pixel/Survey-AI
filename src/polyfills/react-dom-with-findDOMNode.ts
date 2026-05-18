// React 19 removed findDOMNode from react-dom's exports. @birdeye/elemental atoms
// pull in react-onclickoutside, which does `import { findDOMNode } from 'react-dom'`.
// In the production bundle (Rolldown), `__toESM(require_react_dom(), 1)` is hoisted
// and runs once before user code — getters are only created for own-properties that
// existed at that moment, so the runtime-mutation approach in src/polyfills/findDOMNode.ts
// is invisible to named imports. Solution: alias bare `react-dom` to this shim, which
// re-exports the real module *and* publishes a real `findDOMNode` named export. The
// alias only matches the bare specifier (regex /^react-dom$/), so `react-dom/client`,
// `react-dom/server`, etc. still resolve to the real package.

// `react-dom/index.js` bypasses the Vite alias `/^react-dom$/` (which would
// re-resolve back to this file) and lands on the real package. The casts
// silence TS since @types/react-dom only declares the bare specifier.
// @ts-expect-error -- react-dom subpath isn't typed
export * from 'react-dom/index.js';
// @ts-expect-error -- react-dom subpath isn't typed
export { default } from 'react-dom/index.js';

// @ts-expect-error -- react-dom subpath isn't typed
import * as ReactDOMModule from 'react-dom/index.js';

type ReactInternalFiber = {
  stateNode?: unknown;
  child?: ReactInternalFiber | null;
  sibling?: ReactInternalFiber | null;
  return?: ReactInternalFiber | null;
};

type ComponentLike = {
  _reactInternals?: ReactInternalFiber;
  _reactInternalFiber?: ReactInternalFiber;
};

const findDOMNodeShim = (component: unknown): Element | Text | null => {
  if (component == null) return null;
  if (component instanceof Element || component instanceof Text) return component;
  if (typeof component !== 'object') return null;

  const c = component as ComponentLike;
  const root = c._reactInternals ?? c._reactInternalFiber;
  if (!root) return null;

  const stack: ReactInternalFiber[] = [root];
  while (stack.length) {
    const node = stack.pop()!;
    if (node.stateNode instanceof Element || node.stateNode instanceof Text) {
      return node.stateNode;
    }
    if (node.sibling) stack.push(node.sibling);
    if (node.child) stack.push(node.child);
  }
  return null;
};

const existing = (ReactDOMModule as unknown as Record<string, unknown>).findDOMNode;

export const findDOMNode: (component: unknown) => Element | Text | null =
  typeof existing === 'function'
    ? (existing as (c: unknown) => Element | Text | null)
    : findDOMNodeShim;
