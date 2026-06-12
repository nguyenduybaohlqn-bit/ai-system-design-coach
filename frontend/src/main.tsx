import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // nếu có

function App() {
  return <div>App</div>;
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);