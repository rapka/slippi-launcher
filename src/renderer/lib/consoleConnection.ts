import { ipc_connectToConsoleMirror, ipc_disconnectFromConsoleMirror, ipc_startMirroring } from "@console/ipc";
import { MirrorConfig } from "@console/types";
import { ipc_addNewConnection, ipc_deleteConnection, ipc_editConnection } from "@settings/ipc";
import { StoredConnection } from "@settings/types";
import { Ports } from "@slippi/slippi-js";

export type EditConnectionType = Omit<StoredConnection, "id">;

export const addConsoleConnection = async (connection: EditConnectionType) => {
  const res = await ipc_addNewConnection.renderer!.trigger({ connection });
  if (!res.result) {
    console.error("Error adding console: ", res.errors);
    throw new Error("Error adding console");
  }
};

export const editConsoleConnection = async (id: number, connection: EditConnectionType) => {
  const res = await ipc_editConnection.renderer!.trigger({ id, connection });
  if (!res.result) {
    console.error("Error editing console: ", res.errors);
    throw new Error("Error editing console");
  }
};

export const deleteConsoleConnection = async (id: number) => {
  const res = await ipc_deleteConnection.renderer!.trigger({ id });
  if (!res.result) {
    console.error("Error removing console: ", res.errors);
    throw new Error("Error removing console");
  }
};

export const connectToConsole = async (conn: StoredConnection) => {
  const config: MirrorConfig = {
    id: conn.id,
    ipAddress: conn.ipAddress,
    port: conn.port ?? Ports.DEFAULT,
    folderPath: conn.folderPath,
    isRealtime: conn.isRealtime,
    enableRelay: conn.enableRelay,
    useNicknameFolders: conn.useNicknameFolders,
  };

  // Add OBS config if necessary
  if (conn.enableAutoSwitcher && conn.obsIP && conn.obsSourceName) {
    config.autoSwitcherSettings = {
      ip: conn.obsIP,
      password: conn.obsPassword,
      sourceName: conn.obsSourceName,
    };
  }

  const res = await ipc_connectToConsoleMirror.renderer!.trigger({ config });
  if (!res.result) {
    console.error("Error connecting to console: ", res.errors);
    throw new Error("Error connecting to console");
  }
};

export const startConsoleMirror = async (ip: string) => {
  const res = await ipc_startMirroring.renderer!.trigger({ ip });
  if (!res.result) {
    console.error("Error starting console mirror: ", res.errors);
    throw new Error("Error starting console mirror");
  }
};

export const disconnectFromConsole = async (ip: string) => {
  const res = await ipc_disconnectFromConsoleMirror.renderer!.trigger({ ip });
  if (!res.result) {
    console.error("Error disconnecting from console mirror: ", res.errors);
    throw new Error("Error disconnecting from console mirror");
  }
};
