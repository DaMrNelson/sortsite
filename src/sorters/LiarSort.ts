import { Sorter } from "./base";
import { next } from "../executor";

export class LiarSort extends Sorter {
  static readonly NAME = "LiarSort";

  async run() {
    for (let i = 0; i < this.data.length; i++) {
      this.record = i; // Right to left
      await next({ sorter: this, action: "moved", dataSortedOverrideCount: i });
    }

    this.record = undefined;
    await next({ sorter: this, action: "complete", dataSortedOverrideCount: this.data.length });
  }
}

export default LiarSort;
