/* eslint-disable import/no-default-export */
import {
  ipc_calculateGameStats,
  ipc_loadProgressUpdatedEvent,
  ipc_loadReplayFolder,
  ipc_statsPageRequestedEvent,
} from "./endpoints";
import { findChild, generateSubFolderTree } from "./folderTree";
import type { Progress } from "./types";

export default {
  findChild,
  generateSubFolderTree,
  onReplayLoadProgressUpdate(handle: (progress: Progress) => void) {
    const { destroy } = ipc_loadProgressUpdatedEvent.renderer!.handle(async (progress) => {
      handle(progress);
    });
    return destroy;
  },
  onStatsPageRequest(handle: (filePath: string) => void) {
    const { destroy } = ipc_statsPageRequestedEvent.renderer!.handle(async ({ filePath }) => {
      handle(filePath);
    });
    return destroy;
  },
  async calculateGameStats(filePath: string) {
    const { result } = await ipc_calculateGameStats.renderer!.trigger({ filePath });
    return result;
  },
  async loadReplayFolder(folderPath: string) {
    const { result } = await ipc_loadReplayFolder.renderer!.trigger({ folderPath });
    return result;
  },
};
