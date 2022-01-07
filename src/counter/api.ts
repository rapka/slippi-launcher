/* eslint-disable import/no-default-export */
import { ipc_counterUpdated, ipc_decrementCounter, ipc_incrementCounter } from "./endpoints";

export default {
  onCounterChange(handle: (val: number) => void) {
    const { destroy } = ipc_counterUpdated.renderer!.handle(async ({ value }) => {
      handle(value);
    });
    return destroy;
  },
  async incrementCounter() {
    console.log("sending 'counter-inc' message to main");
    await ipc_incrementCounter.renderer!.trigger({});
  },
  async decrementCounter() {
    console.log("sending 'counter-dec' message to main");
    await ipc_decrementCounter.renderer!.trigger({});
  },
};
