
 import React from "react";
 import ReactDOM from "react-dom/client";
 import { BrowserRouter } from "react-router-dom";
 import "./index.css";
 import AppRouter from "./router/Router";

 const root = ReactDOM.createRoot(document.getElementById("root"));
 const App = () => {
    root.render(
        <React.StrictMode>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
        </React.StrictMode>
      );
 }
 export default App;

