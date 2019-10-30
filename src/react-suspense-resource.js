import React from "react";

function invariant(cond, message) {
  if (!cond) throw new Error(message);
}

function isComponent(component) {
  return typeof component === "function";
}

function resolveModuleDefault(mod) {
  return (mod && mod.__esModule === true && mod.default) || mod;
}

// A "resource" is really just a deferred value with some methods
// that make it easy to work with React Suspense.
export function createResource(loadResource) {
  let promise, value, error;
  return {
    // The load method is used for preloading the resource.
    // We can call it many times w/out risking re-fetching.
    load() {
      if (!promise) {
        promise = loadResource().then(
          v => {
            // Automatically resolve the default export on JS modules for
            // the common case of `createResource(() => import('./m.js'))`
            value = resolveModuleDefault(v);
            return v;
          },
          e => {
            error = e;
            throw e;
          }
        );
      }

      return promise;
    },

    // The read method is used for reading the resource value
    // and triggering suspense if we don't have it yet.
    read() {
      if (value) {
        return value;
      } else if (error) {
        throw error;
      } else {
        throw promise;
      }
    }
  };
}

// We can use the resource with a hook
//
//   let resource = createResource(() => import('./Comp.js'));
//   let Comp = useResource(resource)
export function useResource(resource) {
  // Automatically kick off loading in case we haven't
  // already initiated preloading.
  resource.load();
  return resource.read();
}

// OR in a higher-order component (assuming it's a component resource)
//
//   let resource = createResource(() => import('./Comp.js'));
//   let Comp = lazy(resource);
//   <Comp />
export function lazy(componentResource) {
  return React.lazy(() =>
    componentResource.load().then(resource => {
      invariant(
        isComponent(resource),
        "lazy() must be used with a component resource"
      );

      return resource;
    })
  );
}

// OR as a prop to a regular component
//
//   let resource = createResource(() => import('./Comp.js'));
//   <Lazy resource={resource} />
export function Lazy({ resource: componentResource }) {
  return React.createElement(
    useResource(componentResource).then(resource => {
      invariant(
        isComponent(resource),
        "<Lazy> must be used with a component resource"
      );

      return resource;
    })
  );
}
