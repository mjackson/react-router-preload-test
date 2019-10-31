import "./App.css";
import React from "react";

import { preloadRoute } from "./react-router.js";

// Create a resource for a component that is to be
// loaded dynamically at runtime
let Message = React.lazy(() => import("./Message.js"));

function Fallback() {
  console.log("render Fallback (suspending)");
  return <p>loading...</p>;
}

function App() {
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

  let [showMessage, setShowMessage] = React.useState(false);

  let ref = React.useRef(null);
  let route = {
    element: <Message text="hello world" ref={ref} />
  };

  // If we don't preload the route, we will render a <Fallback>
  // (you'll see it in the console). But if you uncomment the
  // following line, the <Fallback> never renders because React
  // never suspends! :D :D :D
  // preloadRoute(route); // THIS IS THE COOL PART

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
