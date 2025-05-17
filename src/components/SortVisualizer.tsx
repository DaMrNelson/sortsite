import { useExecutionState } from "../executor";
import { Sorter } from "../sorters/base";
import { DataDisplay, DataDisplayContainer } from "./DataDisplay";
import styles from "./SortVisualizer.module.css";

export const SortVisualizer = ({ sorter }: { sorter: Sorter }) => {
  let highlightProps = useExecutionState((state) => state.highlights[sorter.id]);
  let dataSorted = useExecutionState((state) => state.dataSorted);

  if (highlightProps?.dataSortedOverride) {
    dataSorted = highlightProps.dataSortedOverride;
  }

  return (
    <div className={styles.container}>
      <div className={styles.title}>{sorter.getName()}</div>
      <DataDisplayContainer>
        {dataSorted && <DataDisplay data={dataSorted} background />}
        <DataDisplay data={sorter.data} record={sorter.record} {...highlightProps} />
      </DataDisplayContainer>
    </div>
  );
};
