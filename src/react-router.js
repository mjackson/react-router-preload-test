import { isLazy } from "react-is";

function preloadLazyComponent(lazyComponent) {
  // See initializeLazyComponentType in shared/ReactLazyComponent.js
  // https://github.com/facebook/react/blob/d0fc0ba0/packages/shared/ReactLazyComponent.js
  lazyComponent._ctor().then(mod => {
    lazyComponent._status = 1; // Resolved
    lazyComponent._result = mod.default;
  });
}

export function preloadRoute(route) {
  // If route.element is a React.lazy, preload it.
  let component = route.element.type;
  if (isLazy(component)) {
    preloadLazyComponent(component);
  }

  // TODO: Preload data too?
}
