import "./App.css";
import React from "react";

import { preloadRoute } from "./react-router.js";

function delay(fn, ms) {
  return () =>
    new Promise(resolve => {
      setTimeout(() => {
        fn().then(resolve);
      }, ms);
    });
}

// Use React.lazy when you don't want to import a
// component until it's needed
let Message = React.lazy(delay(() => import("./Message.js"), 3000));

function Fallback() {
  return <p>suspending...</p>;
}

function App() {
  let [showMessage, setShowMessage] = React.useState(false);

  let ref = React.useRef(null);
  let route = {
    element: <Message text="hello world" ref={ref} />
  };

  // Normally, the React.lazy Message component will only begin
  // loading when it is used. In a hierarchy with components that
  // come from different bundles, this causes a waterfall of loading
  // during render at each level of the hierarchy. We use this
  // function to preload the route's component so it renders
  // immediately without suspending.
  preloadRoute(route); // THIS IS THE COOL PART

  // // This shows we don't swap out the underlying element on
  // // subsequent renders. Even though the <Message> element is
  // // re-created each time <App> renders, React detects it has
  // // the same type as the previous render and does not re-render it.
  // let [timer, setTimer] = React.useState(0);
  // React.useEffect(() => {
  //   setInterval(() => {
  //     setTimer(timer => timer + 1);
  //   }, 2000);
  // }, []);

  // // This shows we support refs.
  // React.useEffect(() => {
  //   // Note: There's a weird bug with React.lazy. When we DON'T
  //   // preload the ref is null AFTER the initial render. But it's
  //   // there on subsequent renders. Maybe file an issue about this...
  //   console.log(ref.current);
  // });

  return (
    <div className="App">
      <p>
        <button onClick={() => setShowMessage(!showMessage)}>
          {showMessage ? "Hide" : "Show"} the message
        </button>
      </p>

      <React.Suspense fallback={<Fallback />}>
        {showMessage && route.element}
      </React.Suspense>
    </div>
  );
}

export default App;
