import type { StartBroadcastConfig } from "@broadcast/types";

import { useAccount } from "./useAccount";

export const useBroadcast = () => {
  const user = useAccount((store) => store.user);

  const startBroadcasting = async (config: Omit<StartBroadcastConfig, "authToken">) => {
    if (!user) {
      throw new Error("User is not logged in!");
    }

    const authToken = await user.getIdToken();
    await window.electron.broadcast.startBroadcast({
      ...config,
      authToken,
    });
  };

  const stopBroadcasting = async () => {
    await window.electron.broadcast.stopBroadcast();
  };

  return [startBroadcasting, stopBroadcasting] as const;
};
