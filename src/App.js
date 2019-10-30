import "./App.css";
import React from "react";

import { createResource, lazy } from "./react-suspense-resource.js";

// Create a resource for a component that is to be
// loaded dynamically at runtime
let messageResource = createResource(() => import("./Message.js"));

// We can eagerly load the resource
// messageResource.load();

// OR lazily load it. In this case the resource is a
// React component, so we can pass it directly to React.lazy
// let Message = React.lazy(messageResource.load);

// OR lazily load it via our own React.lazy wrapper
let Message = lazy(messageResource);

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
      {/*
      <React.Suspense fallback={<p>loading...</p>}>
        <Resource resource={messageResource}>
          {Component => <Component />}
        </Resource>
      </React.Suspense>
      */}
    </div>
  );
}

export default App;
