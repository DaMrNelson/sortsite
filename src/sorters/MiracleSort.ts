import { Sorter } from ".";
import { next, type SorterUpdateProps } from "../executor";

export class MiracleSort extends Sorter {
  readonly NAME = "MiracleSort";

  async run() {
    while (true) {
      // Check if the entire list is in order
      let lastVal = this.data[0];
      let allOk = true;
      let fatalCheck: SorterUpdateProps;

      for (let i = 1; i < this.data.length; i++) {
        const val = this.data[i];

        if (val >= lastVal) {
          lastVal = val;
          await next({ sorter: this, action: "check-ok", groupAction: "check-ok", groupActionStart: 0, groupActionEnd: i });
        } else {
          allOk = false;
          fatalCheck = { sorter: this, action: "check-bad", actionIndex: i, groupAction: "check-ok", groupActionStart: 0, groupActionEnd: i };
          await next(fatalCheck);
          break;
        }
      }

      // If all OK, done!
      if (allOk) {
        await next({ sorter: this, action: "complete" });
        return;
      }

      // Wait a few cycles before checking again
      for (let i = 0; i < Math.floor(100 + Math.random() * 100); i++) {
        await next(fatalCheck!);
      }
    }
  }
}

export default MiracleSort;
