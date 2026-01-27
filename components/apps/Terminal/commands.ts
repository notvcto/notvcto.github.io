import { Command, CommandResult } from './types';
import { resolveRelativePath } from '@/lib/fs';

const formatError = (cmd: string, msg: string): CommandResult => ({
    output: `${cmd}: ${msg}`,
    exitCode: 1
});

const formatSuccess = (output: string = ''): CommandResult => ({
    output,
    exitCode: 0
});

// Helper to resolve path against CWD
const resolve = (cwd: string, path: string = '') => resolveRelativePath(cwd, path);

export const commands: Record<string, Command> = {
    // --- Core Filesystem ---

    ls: async (args, stdin, ctx) => {
        const target = args[0] || '.';
        const absPath = resolve(ctx.cwd, target);

        if (!ctx.fs.exists(absPath)) {
            return formatError('ls', `cannot access '${target}': No such file or directory`);
        }

        const stat = ctx.fs.stat(absPath);
        if (stat?.type === 'dir') {
            const children = ctx.fs.list(absPath);
            // Sort: directories first, then alphabetical
            children.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'dir' ? -1 : 1;
            });
            // Space separated names
            const names = children.map(c => c.name).join("  ");
            return formatSuccess(names);
        } else {
            // File
            return formatSuccess(stat?.name || target);
        }
    },

    cd: async (args, stdin, ctx) => {
        const target = args[0] || '~';
        const absPath = resolve(ctx.cwd, target);

        if (!ctx.fs.exists(absPath)) {
            return formatError('cd', `${target}: No such file or directory`);
        }

        const stat = ctx.fs.stat(absPath);
        if (stat?.type !== 'dir') {
            return formatError('cd', `${target}: Not a directory`);
        }

        ctx.setCwd(absPath);
        return formatSuccess();
    },

    pwd: async (args, stdin, ctx) => {
        return formatSuccess(ctx.cwd);
    },

    cat: async (args, stdin, ctx) => {
        if (args.length === 0) return formatError('cat', 'missing operand');
        const absPath = resolve(ctx.cwd, args[0]);

        if (!ctx.fs.exists(absPath)) {
            return formatError('cat', `${args[0]}: No such file or directory`);
        }

        const stat = ctx.fs.stat(absPath);
        if (stat?.type === 'dir') {
            return formatError('cat', `${args[0]}: Is a directory`);
        }

        const content = ctx.fs.read(absPath);
        return formatSuccess(content || '');
    },

    mkdir: async (args, stdin, ctx) => {
        if (args.length === 0) return formatError('mkdir', 'missing operand');
        const absPath = resolve(ctx.cwd, args[0]);

        if (ctx.fs.exists(absPath)) {
            return formatError('mkdir', `cannot create directory '${args[0]}': File exists`);
        }

        // Basic check for parent existence
        const parts = absPath.split('/');
        parts.pop();
        const parentPath = parts.join('/') || '/';
        if (!ctx.fs.exists(parentPath)) {
             return formatError('mkdir', `cannot create directory '${args[0]}': No such file or directory`);
        }

        ctx.fs.mkdir(absPath);
        return formatSuccess();
    },

    rm: async (args, stdin, ctx) => {
        if (args.length === 0) return formatError('rm', 'missing operand');
        const absPath = resolve(ctx.cwd, args[0]);

        if (!ctx.fs.exists(absPath)) {
            return formatError('rm', `cannot remove '${args[0]}': No such file or directory`);
        }

        const stat = ctx.fs.stat(absPath);
        if (stat?.type === 'dir') {
             return formatError('rm', `cannot remove '${args[0]}': Is a directory`);
        }

        ctx.fs.delete(absPath);
        return formatSuccess();
    },

    touch: async (args, stdin, ctx) => {
        if (args.length === 0) return formatError('touch', 'missing operand');
        const absPath = resolve(ctx.cwd, args[0]);

        if (!ctx.fs.exists(absPath)) {
             const parts = absPath.split('/');
             parts.pop();
             const parentPath = parts.join('/') || '/';
             if (!ctx.fs.exists(parentPath)) {
                 return formatError('touch', `cannot touch '${args[0]}': No such file or directory`);
             }
             ctx.fs.write(absPath, "");
        }
        return formatSuccess();
    },

    mv: async (args, stdin, ctx) => {
        if (args.length < 2) return formatError('mv', 'missing file operand');
        const srcArg = args[0];
        const destArg = args[1];

        const srcPath = resolve(ctx.cwd, srcArg);
        const destPath = resolve(ctx.cwd, destArg);

        if (!ctx.fs.exists(srcPath)) {
            return formatError('mv', `cannot stat '${srcArg}': No such file or directory`);
        }

        // Logic: if dest exists and is dir, move into it.
        if (ctx.fs.exists(destPath)) {
            const destStat = ctx.fs.stat(destPath);
            if (destStat?.type === 'dir') {
                ctx.fs.move(srcPath, destPath);
                return formatSuccess();
            } else {
                return formatError('mv', `'${destArg}' exists. Overwriting not supported.`);
            }
        }

        const destParentPath = destPath.substring(0, destPath.lastIndexOf('/')) || '/';
        if (!ctx.fs.exists(destParentPath)) {
             return formatError('mv', `cannot move '${srcArg}' to '${destArg}': No such file or directory`);
        }

        const srcParent = srcPath.substring(0, srcPath.lastIndexOf('/')) || '/';
        const destParent = destPath.substring(0, destPath.lastIndexOf('/')) || '/';
        const destName = destPath.split('/').pop() || '';

        if (srcParent !== destParent) {
            ctx.fs.move(srcPath, destParent);
            const srcName = srcPath.split('/').pop() || '';
            // New path after move
            const intermediatePath = (destParent === '/' ? '' : destParent) + '/' + srcName;
            ctx.fs.rename(intermediatePath, destName);
        } else {
            ctx.fs.rename(srcPath, destName);
        }

        return formatSuccess();
    },

    // --- System / Puzzle ---

    lsblk: async (args, stdin, ctx) => {
        // Trigger curiosity if applicable
        ctx.blockDevices.checkCuriosity();

        const header = "NAME   TYPE     MOUNTPOINT";
        const lines = [header];

        const order = ['sda', 'sda1', 'sr0'];

        order.forEach(id => {
            const dev = ctx.devices[id];
            if (dev) {
                const name = dev.name.padEnd(7);
                const type = dev.type.padEnd(9);
                const mp = dev.mounted ? (dev.mountPoint || '') : '';
                lines.push(`${name}${type}${mp}`);
            }
        });

        return formatSuccess(lines.join('\n'));
    },

    mount: async (args, stdin, ctx) => {
        // Trigger curiosity if applicable (usage of mount command counts)
        ctx.blockDevices.checkCuriosity();

        if (args.length === 0) return formatError('mount', 'missing operand');

        const devPath = args[0];
        const mountPoint = args[1];

        const result = await ctx.blockDevices.mount(devPath, mountPoint, 'terminal');

        if (result.success) {
            return formatSuccess();
        } else {
            return {
                output: result.error || 'mount: failed',
                exitCode: 1
            };
        }
    },

    dmesg: async (args, stdin, ctx) => {
        // Trigger curiosity if applicable
        ctx.blockDevices.checkCuriosity();

        const sr0 = ctx.devices.sr0;

        if (sr0.state !== 'idle') {
             return formatSuccess(`[    0.000000] Linux version 5.15.0-76-generic (buildd@lcy02-amd64-046) (gcc (Ubuntu 11.3.0-1ubuntu1~22.04.1) 11.3.0, GNU ld (GNU Binutils for Ubuntu) 2.38) #83-Ubuntu SMP Thu Jun 15 19:16:32 UTC 2023
[    0.342111] sr0: CD-ROM detected, media present`);
        }

        return formatSuccess("");
    },

    grep: async (args, stdin, ctx) => {
        // grep consumes stdin.
        // It can also take filename args, but scope says: "dmesg | grep".
        // Basic grep implementation:
        // grep [-i] pattern

        const ignoreCase = args.includes('-i');
        const filteredArgs = args.filter(a => a !== '-i');
        const pattern = filteredArgs[0] || '';

        if (!pattern) return formatError('grep', 'usage: grep [-i] pattern');

        if (!stdin) return formatSuccess("");

        const lines = stdin.split('\n');
        const matches = lines.filter(line => {
            if (ignoreCase) {
                return line.toLowerCase().includes(pattern.toLowerCase());
            }
            return line.includes(pattern);
        });

        return formatSuccess(matches.join('\n'));
    },

    clear: async (args, stdin, ctx) => {
        return {
            output: '',
            exitCode: 0,
            clear: true
        };
    },

    echo: async (args, stdin, ctx) => {
        return formatSuccess(args.join(' '));
    }
};
