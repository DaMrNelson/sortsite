import { create, type StoreApi } from "zustand";
import type { Sorter } from "./sorters";
import type { HighlightProps } from "./components/DataDisplay";
import BogoSort from "./sorters/BogoSort";
import StalinSort from "./sorters/StalinSort";
import MergeSort from "./sorters/MergeSort";
import BubbleSort from "./sorters/BubbleSort";
import InsertionSort from "./sorters/InsertionSort";

export const RANDOM_COUNT = 100;
//export const RANDOM_COUNT = 6;
export const RANDOM_MIN = 0;
export const RANDOM_MAX = 100;

export const ERR_STOP_REQUESTED = Symbol("Stop requested");

export const ACTION_COLOR_MAP: Record<SorterPromiseAction, string> = {
  "check-ok": "#00FF00",
  "check-bad": "#FF0000",
  "moved": "#0000FF",
  "complete": "#00FF00",
}

export type ExecutionState = {
  running: boolean,
  stop: boolean,
  sorters: Sorter[],
  data: number[],
  dataSorted: number[],
  highlights: { [sorterId: symbol]: HighlightProps | undefined },
  set: StoreApi<ExecutionState>["setState"],
  setData: (data: number[]) => void,
};
/** DO NOT USE! Never updated, even when data is regenerated. */
const _initialData = generateData();
/** Hookable portion of the execution state. Intended to be infrequently updated as the top-level React app hooks to this. */
export const useExecutionState = create<ExecutionState>()((set) => ({
  running: false,
  stop: false,
  sorters: [
    new BogoSort(_initialData),
    new StalinSort(_initialData),
    new MergeSort(_initialData),
    new BubbleSort(_initialData),
    new InsertionSort(_initialData),
  ],
  data: _initialData,
  dataSorted: [..._initialData].sort((a, b) => a - b),
  highlights: {},
  set: set,
  setData: (data) => {
    set((state) => ({
      data,
      dataSorted: [...data].sort((a, b) => a - b),
      // TODO: This seems hacky and typescript throws an error,
      //       but I really don't love the idea of hooking around sorter.data.
      //       Q: Other solutions? Ie better mapping, don't replace the class, etc
      // @ts-ignore
      sorters: state.sorters.map((sorter) => new sorter.constructor(data)),
    }))
  }
}));

type SorterPromiseAction = "moved" | "check-ok" | "check-bad" | "complete";

/** State that should NEVER be tied into React hooks. Frequent updates, persistent objects. */
export const unhookedExecutionState = {
  numSorters: 0,
  waitingPromises: [] as SorterPromiseWrapper[],
  incompleteSorters: [] as Sorter[],
  completedSorters: [] as Sorter[],
};

export const startExecution = () => {
  const state = useExecutionState.getState();

  if (state.running) {
    return;
  }

  useExecutionState.setState({ running: true });
  unhookedExecutionState.numSorters = state.sorters.length;
  unhookedExecutionState.incompleteSorters = [...state.sorters];

  // Start sorter execution
  unhookedExecutionState.incompleteSorters.forEach((sorter) => sorter.run());
};

export const stopExecution = () => {
  if (useExecutionState.getState().stop) {
    return;
  }

  useExecutionState.setState({ stop: true }); // Will stop next execution cycle
};

export function generateData () {
  //return [...Array(RANDOM_COUNT)].map(() => Math.floor(Math.random() * (RANDOM_MAX - RANDOM_MIN) + RANDOM_MIN))
  return [...Array(RANDOM_COUNT)].map(() => Math.random() * (RANDOM_MAX - RANDOM_MIN) + RANDOM_MIN)
};

class SorterPromiseWrapper {
  promise: Promise<undefined>;
  resolve: any; // TODO: Typing
  reject: any;

  sorter: Sorter;
  highlightProps?: HighlightProps;

  constructor(sorter: Sorter, highlightProps?: HighlightProps) {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });

    this.sorter = sorter;
    this.highlightProps = highlightProps;
  }
}



export const next = async (sorter: Sorter, action: SorterPromiseAction, actionIndex?: number, groupAction?: SorterPromiseAction, groupActionStart?: number, groupActionEnd?: number) => {
  let myPromise: SorterPromiseWrapper | null = null;

  // Add to promise wait list or complete
  if (action === "complete") {
    const originalDataSorted = useExecutionState.getState().dataSorted;
    const isCorrect = sorter.data.length === originalDataSorted.length && originalDataSorted.every((v, i) => v === sorter.data[i]);
    console.log("Complete", sorter, "! Correct:", isCorrect);

    unhookedExecutionState.completedSorters.push(sorter);
    unhookedExecutionState.incompleteSorters.splice(unhookedExecutionState.incompleteSorters.indexOf(sorter), 1);

    useExecutionState.setState((state) => ({
      highlights: {
        ...state.highlights,
        [sorter.id]: {
          groupedColor: ACTION_COLOR_MAP["complete"],
          groupIndexStart: 0,
        }
      }
    }));

    if (unhookedExecutionState.incompleteSorters.length === 0) {
      // TODO: Update state for all complete
      console.log("All completed!");
      useExecutionState.setState({ running: false, stop: false });
      return;
    }
  } else {
    // Build highlight props
    const highlightProps: HighlightProps = {
      // Action highlight (single index)
      ...(action !== undefined ? {
        focusedIndex: actionIndex,
        focusedColor: ACTION_COLOR_MAP[action],
      } : {}),

      // Group highlight (multi-index)
      ...(groupAction !== undefined ? {
        groupIndexStart: groupActionStart,
        groupIndexEnd: groupActionEnd,
        groupedColor: ACTION_COLOR_MAP[groupAction],
      } : {}),
    };
    myPromise = new SorterPromiseWrapper(sorter, highlightProps)
    unhookedExecutionState.waitingPromises.push(myPromise);
  }

  // Schedule completion of this step for all promises if this was the last one resolved
  if (unhookedExecutionState.waitingPromises.length === unhookedExecutionState.incompleteSorters.length) {
    // Update displays for the action that was just taken
    useExecutionState.setState((state) => ({
      highlights: {
        ...state.highlights,
        ...Object.fromEntries(
          unhookedExecutionState.waitingPromises
            //.filter((wrapper) => wrapper.actionIndex !== undefined)
            .map((wrapper) => ([
              wrapper.sorter.id,
              wrapper.highlightProps
            ]))
        )
      }
    }));

    // Schedule next frame
    setTimeout(() => {
      // Resolve promises, allowing the next action to be taken.
      const doStop = useExecutionState.getState().stop;
      const toResolve = [...unhookedExecutionState.waitingPromises];
      unhookedExecutionState.waitingPromises.length = 0; // Essentially empties it

      toResolve.forEach((promise) => {
        if (doStop) {
          promise.reject(ERR_STOP_REQUESTED); // Throw an error, stopping the sorter
        } else {
          promise.resolve(); // Allow the sorter to continue
        }
      });

      if (doStop) {
        useExecutionState.setState({ running: false, stop: false });
      }
    }, 1000/30);
    //}, 0);
    //}, 1000);
  }

  // Wait for my promise to complete before resolving
  if (myPromise !== null) {
    await myPromise.promise;
  }
};
