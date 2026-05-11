// Polyfill for ReactDOM.findDOMNode in React 19.
//
// React 19 removed findDOMNode, but @birdeye/elemental atoms (SingleSelect,
// Multiselect, DatePicker, ...) depend on react-onclickoutside, which calls
// ReactDOM.findDOMNode(this) on the HOC'd class component instance. Without
// this polyfill those atoms crash with
//   TypeError: (0 , import_react_dom.findDOMNode) is not a function
//
// react-dom v19 still ships as CommonJS (module.exports = require(...)), and
// it does export the key with a null value (`findDOMNode: null`). Since the
// CJS exports object is mutable and shared between every importer, replacing
// that property with a working implementation here — before any elemental
// atom mounts — lets react-onclickoutside resolve a real function at use
// time. Import this module ONCE, at the very top of the app entry point.

import ReactDOM from 'react-dom';

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

  // Depth-first search for the first host fiber under this component.
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

const reactDomNamespace = ReactDOM as unknown as Record<string, unknown>;
if (typeof reactDomNamespace.findDOMNode !== 'function') {
  reactDomNamespace.findDOMNode = findDOMNodeShim;
}

export {};
