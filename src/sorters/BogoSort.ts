import { Sorter } from "./base";
import { next } from "../executor";

export class BogoSort extends Sorter {
  static readonly NAME = "BogoSort";

  async run() {
    while (true) {
      // Check if the entire list is in order
      let lastVal = this.data[0];
      let allOk = true;

      for (let i = 1; i < this.data.length; i++) {
        const val = this.data[i];

        if (val >= lastVal) {
          lastVal = val;
          await next({ sorter: this, action: "check-ok", groupAction: "check-ok", groupActionStart: 0, groupActionEnd: i });
        } else {
          allOk = false;

          if (this.record === undefined || i - 1 > this.record) {
            this.record = i - 1; // TODO: Publish in next() instead!
          }

          await next({ sorter: this, action: "check-bad", actionIndex: i, groupAction: "check-ok", groupActionStart: 0, groupActionEnd: i });
          break;
        }
      }

      // If all OK, done!
      if (allOk) {
        await next({ sorter: this, action: "complete" });
        return;
      }

      // Randomize the list
      for (let i = 0; i < this.data.length; i++) {
        const replacedIndex = Math.floor(Math.random() * this.data.length);
        [this.data[i], this.data[replacedIndex]] = [this.data[replacedIndex], this.data[i]];
      }
    }
  }
}

export default BogoSort;
