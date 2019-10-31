import React from "react";
import { isLazy } from "react-is";

// This is technically against the rules, but we need it so
// we can preload the whole route tree and avoid cascading
// React.lazy imports.
const preloadReactLazy = type =>
  type._ctor().then(mod => (mod && mod.__esModule && mod.default) || mod);

const lazyTypeCache = new Map();

function unwrapLazyElement(route) {
  let { element } = route;
  let props = { ...element.props, ref: element.ref };
  let cachedType = lazyTypeCache.get(element.type);
  if (cachedType) {
    // We have already loaded this element type, so re-use the
    // one we have in the cache. Do this synchronously so React
    // doesn't have to suspend.
    route.element = React.createElement(cachedType, props);
  } else {
    preloadReactLazy(element.type).then(type => {
      lazyTypeCache.set(element.type, type);
      route.element = React.createElement(type, props);
    });
  }
}

export function preloadRoute(route) {
  // If route.element is a React.lazy, preload it.
  if (isLazy(route.element.type)) {
    unwrapLazyElement(route);
  }

  // TODO: Preload data too?
}
