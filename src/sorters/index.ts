import type { SorterConstructor } from "./base";
import BogoSort from "./BogoSort";
import StalinSort from "./StalinSort";
import MergeSort from "./MergeSort";
import BubbleSort from "./BubbleSort";
import InsertionSort from "./InsertionSort";
import LiarSort from "./LiarSort";
import MiracleSort from "./MiracleSort";
import SleepSort from "./SleepSort";
import SleepSortMS from "./SleepSortMS";
import ThanosSort from "./ThanosSort";
import EndgameSort from "./EndgameSort";

export const MEME_SORTS: SorterConstructor[] = [
  BogoSort, StalinSort, LiarSort, MiracleSort, SleepSort, SleepSortMS, ThanosSort, EndgameSort,
];
export const REAL_SORTS: SorterConstructor[] = [
  MergeSort, BubbleSort, InsertionSort,
];
export const INITIAL_SORTS: SorterConstructor[] = [
  MergeSort, BubbleSort, BogoSort, StalinSort, MiracleSort, InsertionSort,
];
