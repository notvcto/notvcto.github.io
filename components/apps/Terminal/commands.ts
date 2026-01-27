import { Command, CommandResult, TerminalContext } from './types';
import { resolveRelativePath } from '@/lib/fs';

const formatError = (cmd: string, msg: string): CommandResult => ({
    output: `${cmd}: ${msg}`,
    exitCode: 1
});

const formatSuccess = (output: string = ''): CommandResult => ({
    output,
    exitCode: 0
});

const resolve = (cwd: string, path: string = '') => resolveRelativePath(cwd, path);

const helpRegistry: Record<string, string> = {
    ls: 'List directory contents',
    cd: 'Change the shell working directory',
    pwd: 'Print name of current/working directory',
    cat: 'Concatenate files and print on the standard output',
    mkdir: 'Make directories',
    rm: 'Remove files or directories',
    mv: 'Move (rename) files',
    touch: 'Change file timestamps',
    mount: 'Mount a filesystem',
    lsblk: 'List block devices',
    dmesg: 'Print or control the kernel ring buffer',
    grep: 'Print lines that match patterns',
    clear: 'Clear the terminal screen',
    echo: 'Display a line of text',
    help: 'Display information about builtin commands',
    base64: 'Base64 encode/decode data and print to standard output',
    nano: 'Nano\'s ANOther editor, an enhanced free Pico clone'
};

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
            children.sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === 'dir' ? -1 : 1;
            });
            const names = children.map(c => c.name).join("  ");
            return formatSuccess(names);
        } else {
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

        let output = "";
        for (const arg of args) {
             const absPath = resolve(ctx.cwd, arg);
             if (!ctx.fs.exists(absPath)) {
                 return formatError('cat', `${arg}: No such file or directory`);
             }
             const stat = ctx.fs.stat(absPath);
             if (stat?.type === 'dir') {
                 return formatError('cat', `${arg}: Is a directory`);
             }
             const content = ctx.fs.read(absPath);
             if (output && content) output += "\n";
             output += content;
        }
        return formatSuccess(output);
    },

    mkdir: async (args, stdin, ctx) => {
        if (args.length === 0) return formatError('mkdir', 'missing operand');

        for (const arg of args) {
             const absPath = resolve(ctx.cwd, arg);
             if (ctx.fs.exists(absPath)) {
                 return formatError('mkdir', `cannot create directory '${arg}': File exists`);
             }

             const parts = absPath.split('/');
             parts.pop();
             const parentPath = parts.join('/') || '/';
             if (!ctx.fs.exists(parentPath)) {
                 return formatError('mkdir', `cannot create directory '${arg}': No such file or directory`);
             }
             ctx.fs.mkdir(absPath);
        }
        return formatSuccess();
    },

    rm: async (args, stdin, ctx) => {
        if (args.length === 0) return formatError('rm', 'missing operand');

        const targets = args.filter(a => !a.startsWith('-'));
        const recursive = args.includes('-r') || args.includes('-rf');

        for (const target of targets) {
            const absPath = resolve(ctx.cwd, target);
            if (!ctx.fs.exists(absPath)) {
                return formatError('rm', `cannot remove '${target}': No such file or directory`);
            }

            const stat = ctx.fs.stat(absPath);
            if (stat?.type === 'dir' && !recursive) {
                 return formatError('rm', `cannot remove '${target}': Is a directory`);
            }
            ctx.fs.delete(absPath);
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

        if (ctx.fs.exists(destPath)) {
            const destStat = ctx.fs.stat(destPath);
            if (destStat?.type === 'dir') {
                ctx.fs.move(srcPath, destPath);
                return formatSuccess();
            } else {
                ctx.fs.delete(destPath);
            }
        }

        const srcParent = srcPath.substring(0, srcPath.lastIndexOf('/')) || '/';
        const destParent = destPath.substring(0, destPath.lastIndexOf('/')) || '/';
        const destName = destPath.split('/').pop() || '';

        if (!ctx.fs.exists(destParent)) {
             return formatError('mv', `cannot move '${srcArg}' to '${destArg}': No such file or directory`);
        }

        if (srcParent !== destParent) {
             ctx.fs.move(srcPath, destParent);
             const srcName = srcPath.split('/').pop() || '';
             if (srcName !== destName) {
                 const intermediatePath = (destParent === '/' ? '' : destParent) + '/' + srcName;
                 ctx.fs.rename(intermediatePath, destName);
             }
        } else {
             ctx.fs.rename(srcPath, destName);
        }

        return formatSuccess();
    },

    touch: async (args, stdin, ctx) => {
        if (args.length === 0) return formatError('touch', 'missing operand');
        for (const arg of args) {
             const absPath = resolve(ctx.cwd, arg);
             if (ctx.fs.exists(absPath)) {
                 ctx.fs.updateMetadata(absPath, { modifiedAt: Date.now() });
             } else {
                 const parts = absPath.split('/');
                 parts.pop();
                 const parentPath = parts.join('/') || '/';
                 if (!ctx.fs.exists(parentPath)) {
                     return formatError('touch', `cannot touch '${arg}': No such file or directory`);
                 }
                 ctx.fs.write(absPath, "");
             }
        }
        return formatSuccess();
    },

    // --- System / Puzzle ---

    lsblk: async (args, stdin, ctx) => {
        ctx.blockDevices.checkCuriosity();

        const lines = ["NAME   MAJ:MIN RM SIZE   RO TYPE MOUNTPOINT"];
        const list = ['sda', 'sda1', 'sr0'];

        for (const name of list) {
             const dev = ctx.devices[name];
             if (!dev) continue;

             const cName = name.padEnd(6);
             const cMajMin = dev.majMin.padEnd(7);
             const cRm = (dev.removable ? "1" : "0").padEnd(2);
             const cSize = dev.size.padEnd(6);
             const cRo = (dev.readOnly ? "1" : "0").padEnd(2);
             const cType = dev.type.padEnd(4);
             const cMp = dev.mounted ? (dev.mountPoint || '') : '';

             lines.push(`${cName} ${cMajMin} ${cRm} ${cSize} ${cRo} ${cType} ${cMp}`);
        }

        return formatSuccess(lines.join('\n'));
    },

    mount: async (args, stdin, ctx) => {
        ctx.blockDevices.checkCuriosity();
        if (args.length < 2) return formatError('mount', 'usage: mount <device> <dir>');

        const dev = args[0];
        const dir = args[1];
        const absDir = resolve(ctx.cwd, dir);

        const result = ctx.blockDevices.mount(dev, absDir, 'terminal');

        if (result.success) return formatSuccess();
        return formatError('mount', result.error || 'failed');
    },

    dmesg: async (args, stdin, ctx) => {
        ctx.blockDevices.checkCuriosity();

        const sr0 = ctx.devices.sr0;
        let logs = [
            `[    0.000000] Linux version 5.15.0-76-generic (buildd@lcy02-amd64-046) (gcc (Ubuntu 11.3.0-1ubuntu1~22.04.1) 11.3.0, GNU ld (GNU Binutils for Ubuntu) 2.38) #83-Ubuntu SMP Thu Jun 15 19:16:32 UTC 2023`,
            `[    0.004000] Command line: BOOT_IMAGE=/boot/vmlinuz-5.15.0-76-generic root=UUID=0a1b2c3d-4e5f-6g7h-8i9j-0k1l2m3n4o5p ro quiet splash vt.handoff=7`,
            `[    0.512341] ata1.00: ATA-9: QEMU HARDDISK, 2.5+, max UDMA/100`,
            `[    0.512666] ata1.00: 50331648 sectors, multi 16: LBA48 NCQ (depth 32), AA`
        ];

        if (sr0.state !== 'idle') {
             logs.push(`[    1.242111] sr0: scsi3-mmc drive: 48x/48x writer cd/rw xa/form2 cdda tray`);
             logs.push(`[    1.242115] sr0: Attached scsi CD-ROM sr0`);
        }

        if (sr0.mountAttempts > 0 && !sr0.mounted && sr0.state !== 'armed') {
             logs.push(`[  ${(10 + sr0.mountAttempts * 2.5).toFixed(6)}] sr0: CD-ROM error: access denied`);
        }

        return formatSuccess(logs.join('\n'));
    },

    grep: async (args, stdin, ctx) => {
        const ignoreCase = args.includes('-i');
        const patterns = args.filter(a => !a.startsWith('-'));
        const pattern = patterns[0] || '';

        if (!pattern) return formatError('grep', 'usage: grep [-i] pattern');

        const inputLines = stdin ? stdin.split('\n') : [];
        const matches = inputLines.filter(line => {
             const l = ignoreCase ? line.toLowerCase() : line;
             const p = ignoreCase ? pattern.toLowerCase() : pattern;
             return l.includes(p);
        });

        return formatSuccess(matches.join('\n'));
    },

    clear: async () => ({ output: '', exitCode: 0, clear: true }),

    echo: async (args) => formatSuccess(args.join(' ')),

    help: async () => {
        const lines = ["GNU bash, version 5.1.16(1)-release (x86_64-pc-linux-gnu)", "These shell commands are defined internally.  Type `help' to see this list.", ""];

        const maxLen = Math.max(...Object.keys(helpRegistry).map(k => k.length));

        Object.keys(helpRegistry).sort().forEach(cmd => {
             const desc = helpRegistry[cmd];
             lines.push(`${cmd.padEnd(maxLen + 2)} ${desc}`);
        });

        return formatSuccess(lines.join('\n'));
    },

    base64: async (args, stdin, ctx) => {
        const decode = args.includes('-d');
        const files = args.filter(a => !a.startsWith('-'));

        let input = stdin;

        if (files.length > 0) {
             const absPath = resolve(ctx.cwd, files[0]);
             if (!ctx.fs.exists(absPath)) return formatError('base64', `${files[0]}: No such file`);
             const content = ctx.fs.read(absPath);
             input = content || '';
        }

        if (!input && !files.length && !stdin) {
             return formatError('base64', 'missing operand');
        }

        try {
            if (decode) {
                 return formatSuccess(atob(input.trim()));
            } else {
                 return formatSuccess(btoa(input));
            }
        } catch (e) {
            return formatError('base64', 'invalid input');
        }
    },

    nano: async (args, stdin, ctx) => {
        if (args.length === 0) return formatError('nano', 'missing filename');

        const target = args[0];
        const absPath = resolve(ctx.cwd, target);

        const parts = absPath.split('/');
        parts.pop();
        const parentPath = parts.join('/') || '/';

        if (!ctx.fs.exists(parentPath)) {
             return formatError('nano', `Error opening file: ${target}: No such file or directory`);
        }

        return {
             output: '',
             exitCode: 0,
             interactive: {
                 mode: 'nano',
                 args: [absPath]
             }
        };
    }
};
