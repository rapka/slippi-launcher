import { DolphinLaunchType } from "@dolphin/types";
import {
  ipc_setBetaNetplay,
  ipc_setBetaPlayback,
  ipc_setExtraSlpPaths,
  ipc_setIsoPath,
  ipc_setLaunchMeleeOnPlay,
  ipc_setNetplayDolphinPath,
  ipc_setPlaybackDolphinPath,
  ipc_setRootSlpPath,
  ipc_setSpectateSlpPath,
  ipc_setUseMonthlySubfolders,
} from "@settings/ipc";
import { AppSettings } from "@settings/types";
import { ipcRenderer } from "electron";
import create from "zustand";
import { combine } from "zustand/middleware";

const initialState = ipcRenderer.sendSync("getAppSettingsSync") as AppSettings;
console.log("initial state: ", initialState);

export const useSettings = create(
  combine(
    {
      ...initialState,
    },
    (set) => ({
      updateSettings: (settings: AppSettings) => set(() => settings),
    }),
  ),
);

export const useIsoPath = () => {
  const isoPath = useSettings((store) => store.settings.isoPath);
  const setPath = async (isoPath: string | null) => {
    const setResult = await ipc_setIsoPath.renderer!.trigger({ isoPath });
    if (!setResult.result) {
      throw new Error("Error setting ISO path");
    }
  };
  return [isoPath, setPath] as const;
};

export const useRootSlpPath = () => {
  const rootSlpPath = useSettings((store) => store.settings.rootSlpPath);
  const setReplayDir = async (path: string) => {
    const setResult = await ipc_setRootSlpPath.renderer!.trigger({ path });
    if (!setResult.result) {
      throw new Error("Error setting root SLP path");
    }
  };
  return [rootSlpPath, setReplayDir] as const;
};

export const useMonthlySubfolders = () => {
  const useMonthlySubfolders = useSettings((store) => store.settings.useMonthlySubfolders);
  const setUseMonthlySubfolders = async (toggle: boolean) => {
    const setResult = await ipc_setUseMonthlySubfolders.renderer!.trigger({ toggle });
    if (!setResult.result) {
      throw new Error("Error setting use monthly subfolders");
    }
  };
  return [useMonthlySubfolders, setUseMonthlySubfolders] as const;
};

export const useSpectateSlpPath = () => {
  const spectateSlpPath = useSettings((store) => store.settings.spectateSlpPath);
  const setSpectateDir = async (path: string) => {
    const setResult = await ipc_setSpectateSlpPath.renderer!.trigger({ path });
    if (!setResult.result) {
      throw new Error("Error setting spectate SLP path");
    }
  };
  return [spectateSlpPath, setSpectateDir] as const;
};

export const useExtraSlpPaths = () => {
  const extraSlpPaths = useSettings((store) => store.settings.extraSlpPaths);
  const setExtraSlpDirs = async (paths: string[]) => {
    const setResult = await ipc_setExtraSlpPaths.renderer!.trigger({ paths });
    if (!setResult.result) {
      throw new Error("Error setting extra SLP paths");
    }
  };
  return [extraSlpPaths, setExtraSlpDirs] as const;
};

export const useDolphinPath = (dolphinType: DolphinLaunchType) => {
  const netplayDolphinPath = useSettings((store) => store.settings.netplayDolphinPath);
  const setNetplayPath = async (path: string) => {
    const setResult = await ipc_setNetplayDolphinPath.renderer!.trigger({ path });
    if (!setResult.result) {
      throw new Error("Error setting netplay dolphin path");
    }
  };

  const playbackDolphinPath = useSettings((store) => store.settings.playbackDolphinPath);
  const setPlaybackPath = async (path: string) => {
    const setResult = await ipc_setPlaybackDolphinPath.renderer!.trigger({ path });
    if (!setResult.result) {
      throw new Error("Error setting playback dolphin path");
    }
  };

  switch (dolphinType) {
    case DolphinLaunchType.NETPLAY: {
      return [netplayDolphinPath, setNetplayPath] as const;
    }
    case DolphinLaunchType.PLAYBACK: {
      return [playbackDolphinPath, setPlaybackPath] as const;
    }
  }
};

export const useLaunchMeleeOnPlay = () => {
  const launchMeleeOnPlay = useSettings((store) => store.settings.launchMeleeOnPlay);
  const setLaunchMelee = async (launchMelee: boolean) => {
    const setResult = await ipc_setLaunchMeleeOnPlay.renderer!.trigger({ launchMelee });
    if (!setResult.result) {
      throw new Error("Error setting launch melee on Play");
    }
  };

  return [launchMeleeOnPlay, setLaunchMelee] as const;
};

export const useBetaDolphin = (dolphinType: DolphinLaunchType) => {
  const betaNetplay = useSettings((state) => state.settings.betaNetplay);
  const setBetaNetplay = async (installBeta: boolean) => {
    const setResult = await ipc_setBetaNetplay.renderer!.trigger({ installBeta });
    if (!setResult.result) {
      throw new Error("Error setting Netplay Dolphin release channel");
    }
  };

  const betaPlayback = useSettings((state) => state.settings.betaPlayback);
  const setBetaPlayback = async (installBeta: boolean) => {
    const setResult = await ipc_setBetaPlayback.renderer!.trigger({ installBeta });
    if (!setResult.result) {
      throw new Error("Error setting Plaback Dolphin release channel");
    }
  };

  switch (dolphinType) {
    case DolphinLaunchType.NETPLAY: {
      return [betaNetplay, setBetaNetplay] as const;
    }
    case DolphinLaunchType.PLAYBACK: {
      return [betaPlayback, setBetaPlayback] as const;
    }
  }
};
