import "./App.css";
import MainPanel from "./components/MainPanel";
import { RecoilRoot } from "recoil";

function App() {
  return (
    <RecoilRoot>
      <div className="App">
        <header className="App-header">
          <MainPanel />
        </header>
      </div>
    </RecoilRoot>
  );
}

export default App;
