import { useExecutionState } from "../executor";
import { Sorter } from "../sorters";
import DataDisplay from "./DataDisplay";
import styles from "./SortVisualizer.module.css";

export const SortVisualizer = ({ name, sorter }: { name: string, sorter: Sorter }) => {
  const actionDisplay = useExecutionState((state) => state.actionDisplays[sorter.id]);
  const extraProps = actionDisplay && actionDisplay.action !== "complete" ? {
    focusedIndex: actionDisplay.actionIndex,
    focusedColor: (
      actionDisplay.action === "check-ok" ?
        "#00FF00"
      : actionDisplay.action === "check-bad" ?
        "#FF0000"
      : //: actionDisplay.action === "moved" ?
        "#0000FF"
    )
  } : {};

  return (
    <div className={styles.container}>
      <div className={styles.title}>{name}</div>
      {<DataDisplay data={sorter.data} record={sorter.record} {...extraProps} />}
    </div>
  );
};
