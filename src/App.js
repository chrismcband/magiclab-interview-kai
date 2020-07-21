import React from "react";
import Feed from "./components/feed";
import "./styles.css";

const APP_STYLE = {
  background: "#DDD"
};

export default function App() {
  return (
    <div className="App" style={APP_STYLE}>
      <Feed />
    </div>
  );
}
