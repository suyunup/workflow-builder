import { ReactFlowProvider } from "reactflow";
import { FlowCanvas } from "./components/FlowCanvas";

function App() {
  return (
    <ReactFlowProvider>
      <div className="w-full h-screen">
        <FlowCanvas />
      </div>
    </ReactFlowProvider>
  );
}

export default App;
