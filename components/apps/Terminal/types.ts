import { useFS } from "@/lib/fs";
import { useBlockDevices } from "@/lib/hooks/use-block-devices";
import { BlockDevice } from "@/lib/store/blockDevices";

export interface TerminalContext {
  cwd: string;
  setCwd: (path: string) => void;
  fs: ReturnType<typeof useFS>;
  blockDevices: ReturnType<typeof useBlockDevices>;
  devices: Record<string, BlockDevice>;
}

export interface CommandResult {
  output: string;
  exitCode: number;
  clear?: boolean;
  interactive?: {
    mode: 'nano';
    args: string[];
  };
}

export type Command = (
  args: string[],
  stdin: string,
  context: TerminalContext
) => Promise<CommandResult> | CommandResult;
