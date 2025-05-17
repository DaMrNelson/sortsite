import { useExecutionState } from "../executor";
import { Sorter } from "../sorters";
import { DataDisplay, DataDisplayContainer } from "./DataDisplay";
import styles from "./SortVisualizer.module.css";

export const SortVisualizer = ({ sorter }: { sorter: Sorter }) => {
  let highlightProps = useExecutionState((state) => state.highlights[sorter.id]);
  const dataSorted = useExecutionState((state) => state.dataSorted);

  return (
    <div className={styles.container}>
      <div className={styles.title}>{sorter.NAME}</div>
      <DataDisplayContainer>
        {dataSorted && <DataDisplay data={dataSorted} background />}
        {<DataDisplay data={sorter.data} record={sorter.record} {...highlightProps} />}
  </DataDisplayContainer>
    </div>
  );
};
