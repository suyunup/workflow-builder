import { ReactFlowProvider } from "reactflow";
import { FlowCanvas } from "./components/FlowCanvas";
import { TestFlow } from "./components/test/TestFlow";

function App() {
  return (
    <ReactFlowProvider>
      <div className="w-full h-screen">
        <FlowCanvas />
        {/* <TestFlow /> */}
      </div>
    </ReactFlowProvider>
  );
}

export default App;
