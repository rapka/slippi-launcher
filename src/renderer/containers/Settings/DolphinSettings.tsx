/** @jsx jsx */
import { DolphinLaunchType } from "@dolphin/types";
import { css, jsx } from "@emotion/react";
import Button from "@material-ui/core/Button";
import CircularProgress from "@material-ui/core/CircularProgress";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import Typography from "@material-ui/core/Typography";
import { isLinux, isMac } from "common/constants";
import { remote, shell } from "electron";
import electronLog from "electron-log";
import capitalize from "lodash/capitalize";
import React from "react";

import { ConfirmationModal } from "@/components/ConfirmationModal";
import { DevGuard } from "@/components/DevGuard";
import { PathInput } from "@/components/PathInput";
import { useDolphin, useDolphinStore } from "@/lib/hooks/useDolphin";
import { useBetaDolphin, useDolphinPath } from "@/lib/hooks/useSettings";

import { SettingItem } from "./SettingItem";

const log = electronLog.scope("DolphinSettings");

export const DolphinSettings: React.FC<{ dolphinType: DolphinLaunchType }> = ({ dolphinType }) => {
  const [dolphinPath, setDolphinPath] = useDolphinPath(dolphinType);
  const [resetModalOpen, setResetModalOpen] = React.useState(false);
  const [isResetting, setIsResetting] = React.useState(false);
  const [betaDolphin, setBetaDolphin] = useBetaDolphin(dolphinType);
  const dolphinIsOpen = useDolphinStore((store) =>
    dolphinType === DolphinLaunchType.NETPLAY ? store.netplayDolphinOpen : store.playbackDolphinOpen,
  );
  const { openConfigureDolphin, reinstallDolphin, clearDolphinCache } = useDolphin();

  const onBetaDolphinChange = async (value: string) => {
    setIsResetting(true);
    const dolphinVersion = value === "true";
    await setBetaDolphin(dolphinVersion);
    setIsResetting(false);
  };

  const openDolphinDirectoryHandler = async () => {
    shell.openItem(dolphinPath);
  };

  const configureDolphinHandler = async () => {
    openConfigureDolphin(dolphinType);
  };

  const reinstallDolphinHandler = async () => {
    setIsResetting(true);
    await reinstallDolphin(dolphinType);
    setIsResetting(false);
  };

  const clearDolphinCacheHandler = async () => {
    clearDolphinCache(dolphinType);
  };

  const dolphinTypeName = capitalize(dolphinType);
  return (
    <div>
      <Typography variant="h5">{dolphinTypeName} Dolphin Settings</Typography>
      <SettingItem name={`Configure ${dolphinType} Dolphin`}>
        <div
          css={css`
            display: flex;
            & > button {
              margin-right: 10px;
            }
          `}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={configureDolphinHandler}
            disabled={isResetting || dolphinIsOpen}
          >
            Configure Dolphin
          </Button>
          <Button variant="outlined" color="primary" onClick={openDolphinDirectoryHandler} disabled={isResetting}>
            Open containing folder
          </Button>
        </div>
      </SettingItem>
      <DevGuard show={isLinux}>
        <SettingItem
          name={`${dolphinType} Dolphin Directory`}
          description={`The path to the folder containing the ${dolphinTypeName} Dolphin executable.`}
        >
          <PathInput
            value={dolphinPath ?? ""}
            onSelect={setDolphinPath}
            placeholder="No folder set"
            options={{ properties: ["openDirectory"] }}
          />
        </SettingItem>
      </DevGuard>
      {!isLinux && <ImportDolphinConfigForm dolphinType={dolphinType} disabled={dolphinIsOpen || isResetting} />}
      <SettingItem name={`Reset ${dolphinTypeName} Dolphin`}>
        <ConfirmationModal
          open={resetModalOpen}
          onClose={() => setResetModalOpen(false)}
          onSubmit={reinstallDolphinHandler}
          title="Are you sure?"
        >
          This will remove all your {dolphinTypeName} Dolphin settings.
        </ConfirmationModal>
        <div
          css={css`
            display: flex;
            & > button {
              margin-right: 10px;
            }
          `}
        >
          <Button
            variant="contained"
            color="secondary"
            onClick={clearDolphinCacheHandler}
            disabled={isResetting || dolphinIsOpen}
          >
            Clear cache
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => setResetModalOpen(true)}
            disabled={isResetting || dolphinIsOpen}
          >
            Reset everything
            {isResetting && (
              <CircularProgress
                css={css`
                  margin-left: 10px;
                `}
                size={16}
                thickness={6}
                color="inherit"
              />
            )}
          </Button>
        </div>
      </SettingItem>
      {dolphinType === DolphinLaunchType.PLAYBACK && (
        <SettingItem
          name={`${dolphinTypeName} Dolphin Release Channel`}
          description="Choose which Slippi Dolphin version to install"
        >
          <RadioGroup value={betaDolphin} onChange={(_event, value) => onBetaDolphinChange(value)}>
            <FormControlLabel
              value={false}
              label="Stable (Ishiiruka)"
              control={<Radio disabled={dolphinIsOpen || isResetting} />}
            />
            <FormControlLabel
              value={true}
              label="Beta (Mainline)"
              control={<Radio disabled={dolphinIsOpen || isResetting} />}
            />
          </RadioGroup>
        </SettingItem>
      )}
    </div>
  );
};

const ImportDolphinConfigForm: React.FC<{
  dolphinType: DolphinLaunchType;
  disabled: boolean;
}> = ({ dolphinType, disabled }) => {
  const { importDolphin } = useDolphin();
  const dolphinTypeName = capitalize(dolphinType);
  const extension = isMac ? "app" : "exe";
  const importDolphinHandler = (importPath: string) => {
    log.info(`importing dolphin from ${importPath}`);
    importDolphin(importPath, dolphinType);
  };

  const onImportClick = async () => {
    const result = await remote.dialog.showOpenDialog({
      filters: [{ name: "Slippi Dolphin", extensions: [isMac ? "app" : "exe"] }],
    });
    const res = result.filePaths;
    if (result.canceled || res.length === 0) {
      return;
    }
    importDolphinHandler(res[0]);
  };

  return (
    <SettingItem
      name={`Import ${dolphinTypeName} Dolphin Settings`}
      description={`Replace the ${dolphinTypeName} Dolphin settings with those from a different Dolphin application. To do this, select the Dolphin.${extension} with the desired ${dolphinType} settings.`}
    >
      <Button variant="contained" color="secondary" onClick={onImportClick} disabled={disabled}>
        Import Dolphin settings
      </Button>
    </SettingItem>
  );
};
