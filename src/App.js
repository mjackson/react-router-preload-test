import "./App.css";
import React from "react";

function resolveModuleDefault(mod) {
  return mod && mod.__esModule === true && mod.default ? mod.default : mod;
}

// A "resource" is really just a deferred value with some methods
// that make it easy to work with React Suspense.
function createResource(loadResource) {
  let promise, value, error;
  let pending = true;
  let resource = {
    // Returns true if this resource is not yet loaded.
    get pending() {
      return pending;
    },

    // The load method is used for preloading the resource.
    // We can call it many times w/out risking re-fetching.
    load() {
      if (!promise) {
        promise = loadResource()
          // We automatically resolve the default export on JS modules for
          // the common case of `createResource(() => import('./mod.js'))`
          .then(resolveModuleDefault)
          .then(
            v => {
              pending = false;
              value = v;
              return v;
            },
            e => {
              pending = false;
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
      // Automatically kick off loading here if we haven't
      // already initiated preloading.
      if (!promise) resource.load();

      if (value) {
        return value;
      } else if (error) {
        throw error;
      } else {
        throw promise;
      }
    }
  };

  return resource;
}

// We can use the resource with a hook
function useResource(resource) {
  return resource.read();
}

// OR perhaps a component with a render prop
function Resource({ children, resource }) {
  return children(useResource(resource));
}

///////////////////////////////////////////////////////////////////////////////

// Create a resource for a component that is to be
// loaded dynamically at runtime
const messageResource = createResource(() => import("./Message.js"));

// We can eagerly load the resource
// messageResource.load();

// OR lazily load it. In this case the resource is a
// React component, so we can pass it directly to React.lazy
const Message = React.lazy(messageResource.load);

// But we're not just limited to components. We could load
// data via the same strategy.
// let params = { id: 123 };
// let dataResource = createResource(() => fetch(`/api/messages/${params.id}`));

// OR we could load both code and data as part of the same resource!
// let combinedResource = createResource(() =>
//   Promise.all([
//     import("./Message.js"),
//     fetch(`/api/messages/${params.id}`)
//   ]).then(([mod, data]) => ({
//     component: mod.default,
//     data
//   }))
// );
// let { component, data } = useResource(combinedResource);

function App() {
  let [showMessage, setShowMessage] = React.useState(false);

  return (
    <div className="App">
      <p>
        <button onClick={() => setShowMessage(!showMessage)}>toggle</button>
      </p>

      {/* Use a React.lazy element just like normal */}
      <React.Suspense fallback={<p>loading...</p>}>
        {showMessage && <Message />}
      </React.Suspense>

      {/* OR use a <Resource> element to render with a resource value */}
      <React.Suspense fallback={<p>loading...</p>}>
        <Resource resource={messageResource}>
          {Component => <Component />}
        </Resource>
      </React.Suspense>
    </div>
  );
}

export default App;
