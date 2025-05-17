import Button from "react-bootstrap/Button";
import styles from "./App.module.css";
import { SortVisualizer } from "./components/SortVisualizer";
import { generateData, startExecution, stopExecution, useExecutionState } from "./executor";

export const App = () => {
  const state = useExecutionState();

  const onStartClick = () => {
    startExecution();
  };

  const onGenerateDataClick = () => {
    const data = generateData();
    state.setData(data);
  };

  const onStopClick = () => {
    stopExecution();
  };

  return (
    <div className={styles.content}>
      <div className={styles.header}>
        SORTING ALGORITHMS VISUALIZED
      </div>
      <div className={styles.controls}>
        { state.running ?
          <Button onClick={ () => onStopClick() } disabled={state.stop}>Stop</Button>
        :
          <Button onClick={ () => onStartClick() }>Start</Button>
        }
        <Button onClick={ () => onGenerateDataClick() } disabled={state.running}>Regenerate Data</Button>

        {/* TODO: Speed control: <FormRange /> */}
      </div>

      <div className={styles.sortersContainer}>
        {state.sorters.map((sorter) => (
          <SortVisualizer key={sorter.constructor.name} sorter={sorter} />
        ))}
      </div>
    </div>
  );
};

export default App;
