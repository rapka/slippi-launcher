/* eslint-disable import/no-default-export */

import { ipcRenderer } from "electron";

import {
  ipc_checkForUpdate,
  ipc_checkValidIso,
  ipc_copyLogsToClipboard,
  ipc_deleteDesktopAppPath,
  ipc_fetchNewsFeed,
  ipc_getLatestGitHubReleaseVersion,
  ipc_installUpdate,
  ipc_launcherUpdateDownloadingEvent,
  ipc_launcherUpdateFoundEvent,
  ipc_launcherUpdateReadyEvent,
} from "./endpoints";
import * as time from "./time";

export default {
  time,
  getOsInfoSync() {
    return ipcRenderer.sendSync("getOsInfoSync") as string;
  },
  onDragState(filePaths: string[]) {
    ipcRenderer.send("onDragStart", filePaths);
  },
  getAssetPath(...paths: string[]) {
    return ipcRenderer.sendSync("getAssetPathSync", paths) as string;
  },
  async checkForAppUpdates(): Promise<void> {
    await ipc_checkForUpdate.renderer!.trigger({});
  },
  async fetchNewsFeed() {
    const { result } = await ipc_fetchNewsFeed.renderer!.trigger({});
    return result;
  },
  async installAppUpdate(): Promise<void> {
    await ipc_installUpdate.renderer!.trigger({});
  },
  async copyLogsToClipboard(): Promise<void> {
    await ipc_copyLogsToClipboard.renderer!.trigger({});
  },
  async checkValidIso(path: string) {
    const { result } = await ipc_checkValidIso.renderer!.trigger({ path });
    return result;
  },
  async deleteDesktopAppPath() {
    await ipc_deleteDesktopAppPath.renderer!.trigger({});
  },
  async getLatestGithubReleaseVersion(owner: string, repo: string): Promise<string> {
    const { result } = await ipc_getLatestGitHubReleaseVersion.renderer!.trigger({ owner, repo });
    return result.version;
  },
  onAppUpdateFound(handle: (version: string) => void) {
    const { destroy } = ipc_launcherUpdateFoundEvent.renderer!.handle(async ({ version }) => {
      handle(version);
    });
    return destroy;
  },
  onAppUpdateDownloadProgress(handle: (percent: number) => void) {
    const { destroy } = ipc_launcherUpdateDownloadingEvent.renderer!.handle(async ({ progressPercent }) => {
      handle(progressPercent);
    });
    return destroy;
  },
  onAppUpdateReady(handle: () => void) {
    const { destroy } = ipc_launcherUpdateReadyEvent.renderer!.handle(async () => {
      handle();
    });
    return destroy;
  },
};
