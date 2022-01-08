import { DolphinLaunchType } from "@dolphin/types";
import type { AppSettings } from "@settings/types";
import create from "zustand";
import { combine } from "zustand/middleware";

const initialState = window.electron.settings.getAppSettingsSync();
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
  const setPath = window.electron.settings.setIsoPath;
  return [isoPath, setPath] as const;
};

export const useRootSlpPath = () => {
  const rootSlpPath = useSettings((store) => store.settings.rootSlpPath);
  const setReplayDir = window.electron.settings.setRootSlpPath;
  return [rootSlpPath, setReplayDir] as const;
};

export const useMonthlySubfolders = () => {
  const useMonthlySubfolders = useSettings((store) => store.settings.useMonthlySubfolders);
  const setUseMonthlySubfolders = window.electron.settings.setUseMonthlySubfolders;
  return [useMonthlySubfolders, setUseMonthlySubfolders] as const;
};

export const useSpectateSlpPath = () => {
  const spectateSlpPath = useSettings((store) => store.settings.spectateSlpPath);
  const setSpectateDir = window.electron.settings.setSpectateSlpPath;
  return [spectateSlpPath, setSpectateDir] as const;
};

export const useExtraSlpPaths = () => {
  const extraSlpPaths = useSettings((store) => store.settings.extraSlpPaths);
  const setExtraSlpDirs = window.electron.settings.setExtraSlpPaths;
  return [extraSlpPaths, setExtraSlpDirs] as const;
};

export const useDolphinPath = (dolphinType: DolphinLaunchType) => {
  const netplayDolphinPath = useSettings((store) => store.settings.netplayDolphinPath);
  const setNetplayPath = window.electron.settings.setNetplayDolphinPath;

  const playbackDolphinPath = useSettings((store) => store.settings.playbackDolphinPath);
  const setDolphinPath = window.electron.settings.setPlaybackDolphinPath;

  switch (dolphinType) {
    case DolphinLaunchType.NETPLAY: {
      return [netplayDolphinPath, setNetplayPath] as const;
    }
    case DolphinLaunchType.PLAYBACK: {
      return [playbackDolphinPath, setDolphinPath] as const;
    }
  }
};

export const useLaunchMeleeOnPlay = () => {
  const launchMeleeOnPlay = useSettings((store) => store.settings.launchMeleeOnPlay);
  const setLaunchMelee = window.electron.settings.setLaunchMeleeOnPlay;
  return [launchMeleeOnPlay, setLaunchMelee] as const;
};
