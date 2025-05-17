import { RANDOM_MAX } from "../executor";
import styles from "./DataDisplay.module.css";

export const DataDisplay = ({ data, focusedIndex, focusedColor, record }: { data: number[], focusedIndex?: number, focusedColor?: string, record?: number }) => {
  const colWidth = 1 / data.length;

  return (
    <div className={styles.container}>
      {data.map((val, i) => (
        // TODO: Consider RANDOM_MIN as well? Or have a separate view window property?
        <div
          key={i}
          style={{
            left: `${i / data.length * 100}%`,
            width: `${colWidth * 100}%`,
            top: `${100 - val / RANDOM_MAX * 100}%`,
            bottom: 0,
            ...(i === focusedIndex ? { background: focusedColor } : {}),
          }}
        />
      ))}
      {record !== undefined &&
        <div
          key="record"
          style={{
            left: `${record / data.length * 100}%`,
            width: `${colWidth * 100}%`,
            top: 0,
            bottom: 0,
            background: "rgba(0, 255, 0, 0.25)"
          }}
        />
      }
    </div>
  );
};

export default DataDisplay;
