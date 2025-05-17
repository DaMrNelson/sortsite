import clsx from "clsx";
import { RANDOM_MAX } from "../executor";
import styles from "./DataDisplay.module.css";

export const DataDisplayContainer = (props: React.ComponentProps<"div">) => (
  <div {...props} className={clsx(styles.container, props.className)} />
);

export type HighlightProps = {
  focusedIndex?: number,
  focusedColor?: string,
  groupIndexStart?: number,
  groupIndexEnd?: number,
  groupedColor?: string,
}

export const DataDisplay = ({ data, focusedIndex, focusedColor, groupIndexStart, groupIndexEnd, groupedColor, record, background }: { data: number[], record?: number, bgData?: number[], background?: boolean } & HighlightProps) => {
  const colWidth = 1 / data.length;

  return (
    <div className={clsx(styles.dpContainer, background && styles.bg)}>
      {data.map((val, i) => (
        // TODO: Consider RANDOM_MIN as well? Or have a separate view window property?
        <div
          key={i}
          style={{
            left: `${i / data.length * 100}%`,
            width: `${colWidth * 100}%`,
            top: `${100 - val / RANDOM_MAX * 100}%`,
            bottom: 0,
            ...(
              // Focused
              i === focusedIndex ?
                { background: focusedColor }
              // Grouped
              : (
                (groupIndexStart !== undefined || groupIndexEnd !== undefined)
                && (groupIndexStart === undefined || i >= groupIndexStart)
                && (groupIndexEnd === undefined || i < groupIndexEnd)
              ) ? { background: groupedColor }
              // Not focused on grouped
              :
                {}
            ),
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
