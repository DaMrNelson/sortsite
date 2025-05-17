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
    <div className={styles.sorter}>
      <div className={styles.controls}>
        { state.running ?
          <button onClick={ () => onStopClick() } disabled={state.stop}>Stop</button>
        :
          <button onClick={ () => onStartClick() }>Start</button>
        }
        <button onClick={ () => onGenerateDataClick() } disabled={state.running}>Regenerate Data</button>
        {/* TODO: Speed control */}
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
