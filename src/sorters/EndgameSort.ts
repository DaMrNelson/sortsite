
import { Sorter } from ".";
import { next } from "../executor";

export class EndgameSort extends Sorter {
  readonly NAME = "EndgameSort";
  readonly DESCRIPTION = "Check if the list is sorted. If not, snap away half the data. On all future repetitions, if the list is not sorted then snap the missing data back into existence before snapping a new set of random data away.";

  async run() {
    const dataOrig = [...this.data];
    let snapped = false;

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

      // 2. Restore snapped data, if any
      if (snapped) {
        for (let i = 0; i < this.data.length; i++) {
          if (this.data[i] === 0) {
            this.data[i] = dataOrig[i];
            await next({ sorter: this, action: "check-ok", actionIndex: i });
          }
        }
      }

      // 3. Indiscriminately remove half the data (approx)
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

      snapped = true;
    }

    await next({ sorter: this, action: "complete" });
  }
}

export default EndgameSort;
