import { Sorter } from "./base";
import { next } from "../executor";

export class ThanosSort extends Sorter {
  static readonly NAME = "ThanosSort";
  readonly DESCRIPTION = "Check if the list is sorted. If not, remove half the data. Repeat.";

  async run() {
    while (true) {
      // 1. Check if the data is sorted
      let lastVal = undefined;
      let allOk = true;

      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i] === 0) {
          continue;
        }

        if (lastVal === undefined) {
          lastVal = this.data[i];
          continue;
        }

        if (this.data[i] > lastVal) {
          lastVal = this.data[i];
          await next({ sorter: this, action: "check-ok", groupAction: "check-ok", groupActionStart: 0, groupActionEnd: i });
        } else {
          allOk = false;
          await next({ sorter: this, action: "check-bad", actionIndex: i, groupAction: "check-ok", groupActionStart: 0, groupActionEnd: i });
          break;
        }
      }

      if (allOk) {
        break;
      }

      // 2. Indiscriminately remove half the data (approx)
      // Specifically, each being is given a coin flip to survive.
      // I could guarantee 50%, but this lets me scan over the list while I do it
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i] === 0) {
          continue;
        }

        if (Math.random() < 0.50) {
          await next({ sorter: this, action: "check-ok", actionIndex: i });
        } else {
          await next({ sorter: this, action: "check-bad", actionIndex: i });
          this.data[i] = 0;
        }
      }
    }

    await next({ sorter: this, action: "complete" });
  }
}

export default ThanosSort;
