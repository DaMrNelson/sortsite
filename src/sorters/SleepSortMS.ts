import { Sorter } from "./base";
import { next } from "../executor";

/** Technically ms*10, sorry! */
export class SleepSortMS extends Sorter {
  static readonly NAME = "SleepSort (MS)";

  async run() {
    while (true) {
      let cur = 0;

      for (let i = 0; i < this.data.length; i++) {
        const val = this.data[i];
        setTimeout(() => {
          this.data[cur] = val;
          cur += 1;
        }, val * 10);
      }

      while (cur < this.data.length) {
        await next({ sorter: this, action: "check-bad", actionIndex: cur, groupAction: "check-ok", groupActionEnd: cur });
      }

      break;
    }

    await next({ sorter: this, action: "complete" });
  }
}

export default SleepSortMS;
