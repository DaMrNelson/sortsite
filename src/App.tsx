import clsx from "clsx";
import Button from "react-bootstrap/Button";
import FormCheck from "react-bootstrap/FormCheck";
import styles from "./App.module.css";
import { SortVisualizer } from "./components/SortVisualizer";
import { generateData, startExecution, stopExecution, useExecutionState } from "./executor";
import { createRef, useEffect, useState } from "react";
import { MEME_SORTS, REAL_SORTS } from "./sorters";
import type { SorterConstructor } from "./sorters/base";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";

export const App = () => {
  const state = useExecutionState();
  const [headerOpen, setHeaderOpen] = useState(true);

  const realSortsTitleRef = createRef<HTMLInputElement>();
  const memeSortsTitleRef = createRef<HTMLInputElement>();

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

  const onToggleSectionClick = (_: React.ChangeEvent<HTMLInputElement>, ref: React.RefObject<HTMLInputElement | null>, sorterClasses: SorterConstructor[]) => {
    if (!ref.current) {
      return;
    }

    // Check state
    // Note that ref.current.checked is the NEW state, not old.
    // We are trusting the browser to handle indeterminate reasonably here.
    if (ref.current.checked) { // Unchecked or indeterminate -> checked: enable all
      state.set((state) => ({
        sorters: [
          ...state.sorters,
          ...sorterClasses.filter((SorterClass) => !state.sorters.find((sorterInst) => sorterInst instanceof SorterClass))
            .map((SorterClass) => new SorterClass(state.data))
        ]
      }));
    } else { // Checked -> unchecked: disable all
      state.set((state) => ({
        sorters: state.sorters.filter((sorter) =>
          !sorterClasses.find((SorterClass) => sorter instanceof SorterClass)
        )
      }));
    }
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

  // Set sorter section checkbox states
  useEffect(() => {
    const pairs = [{ref: realSortsTitleRef, sorterClasses: REAL_SORTS}, {ref: memeSortsTitleRef, sorterClasses: MEME_SORTS}];

    for (const { ref, sorterClasses}  of pairs) {
      if (ref.current === null) {
        continue;
      }

      let some = false;
      let all = true;

      for (const SorterClass of sorterClasses) {
        if (state.sorters.find((sorterInst) => sorterInst instanceof SorterClass)) {
          some = true;
        } else {
          all = false;
        }
      }

      if (all) {
        ref.current.indeterminate = false;
        ref.current.checked = true;
      } else if (some) {
        ref.current.checked = false;
        ref.current.indeterminate = true;
      } else {
        ref.current.indeterminate = false;
        ref.current.checked = false;
      }
    }
  }, [realSortsTitleRef.current, memeSortsTitleRef.current, state.sorters]);

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
                <div className={styles.sectionTitle}>
                  <FormCheck
                    ref={realSortsTitleRef}
                    id="real-sorts-cb"
                    label="Real Sorts"
                    onChange={(e) => onToggleSectionClick(e, realSortsTitleRef, REAL_SORTS)}
                    disabled={state.running}
                    inline
                  />
                </div>
                {REAL_SORTS.map((SortClass) => <SortCheck key={SortClass.getName()} SorterClass={SortClass} /> )}
              </div>

              <div className={styles.settingSection}>
                <div className={styles.sectionTitle}>
                  <FormCheck
                    ref={memeSortsTitleRef}
                    id="meme-sorts-cb"
                    label="Meme Sorts"
                    onChange={(e) => onToggleSectionClick(e, memeSortsTitleRef, MEME_SORTS)}
                    disabled={state.running}
                    inline
                  />
                </div>
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
  const running = useExecutionState((state) => state.running);

  return (
    <FormCheck
      id={`check-${name}`}
      label={name.replace("Sort", "")}
      checked={selected}
      onChange={() => toggleSorter(SorterClass)}
      disabled={running}
      inline
    />
  );
};

export default App;
