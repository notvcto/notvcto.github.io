import { TerminalContext, CommandResult } from './types';
import { commands } from './commands';
import { useFS } from "@/lib/fs";
import { useBlockDevices } from "@/lib/hooks/use-block-devices";
import { useBlockDeviceStore } from "@/lib/store/blockDevices";

export const useTerminalEngine = () => {
    const fs = useFS();
    const blockDevicesHook = useBlockDevices();
    const { devices } = useBlockDeviceStore();

    const execute = async (
        input: string,
        cwd: string,
        setCwd: (p: string) => void
    ): Promise<CommandResult> => {

        const context: TerminalContext = {
            cwd,
            setCwd,
            fs,
            blockDevices: blockDevicesHook,
            devices
        };

        const segments = input.split('|');
        let currentStdin = '';
        let lastExitCode = 0;

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i].trim();
            if (!segment) {
                // Handle trailing pipe or empty segment?
                // "a | b" -> split -> ["a ", " b"]. Trim -> "a", "b".
                // "a |" -> split -> ["a ", ""].
                // If empty segment is found in middle/end, implies syntax error or just ignore?
                // Standard bash: syntax error near unexpected token `|'
                // We'll ignore empty segments for simplicity unless it's strictly required.
                continue;
            }

            const parts = segment.split(/\s+/);
            const cmdName = parts[0];
            const args = parts.slice(1);

            if (!cmdName) continue;

            const commandFn = commands[cmdName];

            if (!commandFn) {
                return { output: `${cmdName}: command not found`, exitCode: 127 };
            }

            try {
                const result = await commandFn(args, currentStdin, context);

                // If exit code is not 0, standard pipes usually continue?
                // "set -o pipefail" determines if pipeline fails.
                // Standard: output of failed cmd goes to input of next?
                // Requirement: "Stop pipe chain on error"?
                // "Fails in a controlled ... way".
                // If `dmesg` fails, `grep` shouldn't run?
                // Let's adopt strict behavior: if cmd fails, stop.
                if (result.exitCode !== 0) {
                    return result;
                }

                currentStdin = result.output;
                lastExitCode = result.exitCode;
            } catch (e: any) {
                return { output: `System error: ${e.message}`, exitCode: 1 };
            }
        }

        return { output: currentStdin, exitCode: lastExitCode };
    };

    return { execute };
};
