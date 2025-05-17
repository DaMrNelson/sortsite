import { Sorter } from ".";
import { next } from "../executor";

/** WOW this one sucks */
export class BubbleSort extends Sorter {
  readonly NAME = "BubbleSort";

  async run() {
    let moved = 0;

    while (true) {
      let swaps = 0;

      for (let i = 0; i < this.data.length - moved; i++) {
        if (this.data[i] > this.data[i + 1]) {
          [this.data[i], this.data[i + 1]] = [this.data[i + 1], this.data[i]];
          swaps += 1;
          await next({ sorter: this, action: "check-bad", actionIndex: i + 1, groupAction: "check-ok", groupActionStart: this.data.length - moved, groupActionEnd: this.data.length });
        } else {
          await next({ sorter: this, action: "check-ok", actionIndex: i, groupAction: "check-ok", groupActionStart: this.data.length - moved, groupActionEnd: this.data.length });
        }
      }

      if (swaps === 0) {
        break;
      }

      moved += 1;
    }

    await next({ sorter: this, action: "complete" });
  }
}

export default BubbleSort;
