import clsx from "clsx";
import Button from "react-bootstrap/Button";
import FormCheck from "react-bootstrap/FormCheck";
import styles from "./App.module.css";
import { SortVisualizer } from "./components/SortVisualizer";
import { generateData, startExecution, stopExecution, useExecutionState } from "./executor";
import { useState } from "react";
import { MEME_SORTS, REAL_SORTS } from "./sorters";
import type { SorterConstructor } from "./sorters/base";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";

export const App = () => {
  const state = useExecutionState();
  const [headerOpen, setHeaderOpen] = useState(true);

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

  const controlButtons = (
    <>
      {
        state.running ?
          <Button onClick={ () => onStopClick() } disabled={state.stop}>Stop</Button>
        :
          <Button onClick={ () => onStartClick() }>Start</Button>
      }
      <Button onClick={ () => onGenerateDataClick() } disabled={state.running}>Regenerate Data</Button>
    </>
  );

  return (
    <>
      {headerOpen ?
        <div className={styles.header}>
          <div className={styles.content}>
            <div className={styles.title}>
              SORTING ALGORITHMS VISUALIZED
            </div>

            <div className={styles.settings}>
              <div className={styles.settingSection}>
                <div className={styles.sectionTitle}>Real Sorts</div>
                {REAL_SORTS.map((SortClass) => <SortCheck key={SortClass.getName()} SorterClass={SortClass} /> )}
              </div>

              <div className={styles.settingSection}>
                <div className={styles.sectionTitle}>Meme Sorts</div>
                {MEME_SORTS.map((SortClass) => <SortCheck key={SortClass.getName()} SorterClass={SortClass} /> )}
              </div>
            </div>

            <div className={styles.controls}>
              <div className={styles.sectionTitle}>Controls</div>
              {controlButtons}
              {/* TODO: Speed control: <FormRange /> */}
            </div>

            <div className={clsx(styles.bottomButtons, styles.expanded)} onClick={() => setHeaderOpen(false)}>
              <Button><ChevronUp /></Button>
            </div>
          </div>
        </div>
      :
        <div className={styles.bottomButtons}>
          {controlButtons}
          <Button onClick={() => setHeaderOpen(true)}><ChevronDown /></Button>
        </div>
      }
      <div className={clsx(styles.main, styles.content)}>
        <div className={styles.sortersContainer}>
          {state.sorters.map((sorter) => (
            <SortVisualizer key={sorter.constructor.name} sorter={sorter} />
          ))}
        </div>
      </div>
    </>
  );
};

export const SortCheck = ({ SorterClass }: { SorterClass: SorterConstructor }) => {
  const name = SorterClass.getName();
  const toggleSorter = useExecutionState((state) => state.toggleSorter);
  const selected = useExecutionState((state) => !!state.sorters.find((sorterInst) => sorterInst instanceof SorterClass));

  return (
    <FormCheck id={`check-${name}`} label={name} inline checked={selected} onChange={() => toggleSorter(SorterClass)} />
  );
};

export default App;
