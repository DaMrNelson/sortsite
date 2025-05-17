import { Sorter } from ".";
import { next } from "../executor";

export class SleepSort extends Sorter {
  readonly NAME = "SleepSort";

  async run() {
    while (true) {
      let cur = 0;

      for (let i = 0; i < this.data.length; i++) {
        const val = this.data[i];
        setTimeout(() => {
          this.data[cur] = val;
          cur += 1;
        }, val * 1000);
      }

      while (cur < this.data.length) {
        await next({ sorter: this, action: "check-bad", actionIndex: cur, groupAction: "check-ok", groupActionEnd: cur });
      }

      break;
    }

    await next({ sorter: this, action: "complete" });
  }
}

export default SleepSort;
