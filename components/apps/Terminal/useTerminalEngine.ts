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

        // Refresh devices state (though hook updates cause re-render, explicit fetch here ensures consistency inside async)
        const currentDevices = useBlockDeviceStore.getState().devices;

        const context: TerminalContext = {
            cwd,
            setCwd,
            fs,
            blockDevices: blockDevicesHook,
            devices: currentDevices
        };

        const trimmed = input.trim();
        if (!trimmed) return { output: '', exitCode: 0 };

        const segments = trimmed.split('|');

        // Requirement: Single pipe only. No chaining (length > 2 implies 2 pipes).
        if (segments.length > 2) {
             return { output: 'bash: syntax error: multiple pipes not supported', exitCode: 2 };
        }

        let currentStdin = '';
        let lastExitCode = 0;

        for (let i = 0; i < segments.length; i++) {
            const segment = segments[i].trim();
            if (!segment) {
                 return { output: 'bash: syntax error near unexpected token `|\'', exitCode: 2 };
            }

            // Simple whitespace split. No quoting support per "no variables, no globbing" scope,
            // but arguably users expect 'echo "hello world"' to work.
            // For now, simple split as per "Rewrite command parsing... from zero".
            // If we want quotes, we need a better parser.
            // The prompt says "no variables, no globbing". It doesn't explicitly say "no quotes".
            // But implementing quote parsing "from zero" is robust.
            // Let's stick to simple split for now to match the "UNIX-like" error feel if they try complex stuff,
            // or maybe a regex split that respects quotes if easy.
            // Regex for splitting by space respecting quotes: / +(?=(?:(?:[^"]*"){2})*[^"]*$)/
            // Let's try simple split first. If user wants `echo "hello world"`, it will be `echo`, `"hello`, `world"`.
            // `echo` command can join them.
            // `grep "pattern"` -> `grep`, `"pattern"`. `grep` can strip quotes.
            const parts = segment.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g)?.map(p => {
                if (p.startsWith('"') && p.endsWith('"')) return p.slice(1, -1);
                if (p.startsWith("'") && p.endsWith("'")) return p.slice(1, -1);
                return p;
            }) || [];

            if (parts.length === 0) continue;

            const cmdName = parts[0];
            const args = parts.slice(1);

            const commandFn = commands[cmdName];

            if (!commandFn) {
                return { output: `${cmdName}: command not found`, exitCode: 127 };
            }

            try {
                const result = await commandFn(args, currentStdin, context);

                // Stop pipe chain on error
                if (result.exitCode !== 0) {
                    return result;
                }

                // If interactive, return immediately (cannot pipe out of interactive in this sim)
                if (result.interactive) {
                    return result;
                }

                // If clear, return immediately
                if (result.clear) {
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
