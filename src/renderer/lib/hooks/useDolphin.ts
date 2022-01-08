import type { ReplayQueueItem } from "@dolphin/types";
import { DolphinLaunchType } from "@dolphin/types";
import React from "react";
import { useToasts } from "react-toast-notifications";
import create from "zustand";
import { combine } from "zustand/middleware";

const log = console;

export const useDolphinStore = create(
  combine(
    {
      netplayDolphinOpen: false,
      playbackDolphinOpen: false,
    },
    (set) => ({
      setDolphinOpen: (dolphinType: DolphinLaunchType, val = true) => {
        if (dolphinType === DolphinLaunchType.NETPLAY) {
          set({ netplayDolphinOpen: val });
        } else {
          set({ playbackDolphinOpen: val });
        }
      },
    }),
  ),
);

export const useDolphin = () => {
  const { addToast } = useToasts();
  const setDolphinOpen = useDolphinStore((store) => store.setDolphinOpen);
  const handleError = React.useCallback(
    (errMessage: string) => {
      addToast(errMessage, { appearance: "error" });
    },
    [addToast],
  );

  const openConfigureDolphin = React.useCallback(
    async (dolphinType: DolphinLaunchType) => {
      try {
        await window.electron.dolphin.configureDolphin(dolphinType);
        setDolphinOpen(dolphinType);
      } catch (err) {
        log.error(err);
        handleError(`Error launching ${dolphinType} Dolphin`);
      }
    },
    [handleError, setDolphinOpen],
  );

  const clearDolphinCache = React.useCallback(
    async (dolphinType: DolphinLaunchType) => {
      try {
        await window.electron.dolphin.clearDolphinCache(dolphinType);
      } catch (err) {
        log.error(err);
        handleError(`Error clearing ${dolphinType} Dolphin cache`);
      }
    },
    [handleError],
  );

  const reinstallDolphin = React.useCallback(
    async (dolphinType: DolphinLaunchType) => {
      try {
        await window.electron.dolphin.reinstallDolphin(dolphinType);
      } catch (err) {
        log.error(err);
        handleError("Error reinstalling netplay Dolphin");
      }
    },
    [handleError],
  );

  const launchNetplay = React.useCallback(
    async (bootToCss?: boolean) => {
      try {
        await window.electron.dolphin.launchNetplayDolphin({ bootToCss });
        setDolphinOpen(DolphinLaunchType.NETPLAY);
      } catch (err) {
        log.error(err);
        handleError("Error launching netplay Dolphin");
      }
    },
    [setDolphinOpen, handleError],
  );

  const viewReplays = React.useCallback(
    async (files: ReplayQueueItem[]) => {
      try {
        await window.electron.dolphin.viewSlpReplay(files);
        setDolphinOpen(DolphinLaunchType.PLAYBACK);
      } catch (err) {
        handleError(`Error playing file(s): ${files.join(", ")}`);
      }
    },
    [setDolphinOpen, handleError],
  );

  const importDolphin = React.useCallback(
    async (toImportDolphinPath: string, dolphinType: DolphinLaunchType) => {
      try {
        await window.electron.dolphin.importDolphinSettings({ dolphinType, toImportDolphinPath });
        addToast(`${dolphinType} Dolphin settings successfully imported`, { appearance: "success" });
      } catch (err) {
        handleError(`Error importing ${dolphinType} dolphin settings`);
      }
    },
    [addToast, handleError],
  );

  return {
    openConfigureDolphin: (dolphinType: DolphinLaunchType) => void openConfigureDolphin(dolphinType),
    clearDolphinCache: (dolphinType: DolphinLaunchType) => void clearDolphinCache(dolphinType),
    reinstallDolphin,
    launchNetplay: (bootToCss: boolean) => void launchNetplay(bootToCss),
    viewReplays: (files: ReplayQueueItem[]) => void viewReplays(files),
    importDolphin: (importPath: string, dolphinType: DolphinLaunchType) => void importDolphin(importPath, dolphinType),
  };
};
