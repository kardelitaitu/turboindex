#!/usr/bin/env node

/**
 * TurboIndex — Postinstall Setup Script
 *
 * Creates an isolated Python virtual environment, installs pinned
 * dependencies, and installs the turboindex skill globally.
 * Runs automatically after `npm install -g turboindex`.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const ROOT_DIR = path.join(__dirname, '..');
const VENV_DIR = path.join(ROOT_DIR, '.venv');
const REQUIREMENTS = path.join(ROOT_DIR, 'requirements.txt');
const IS_WIN = process.platform === 'win32';
const SKILL_SRC = path.join(ROOT_DIR, 'skills', 'turboindex');
const SKILL_DEST = path.join(os.homedir(), '.agents', 'skills', 'turboindex');

const TOTAL_STEPS = 5;
let currentStep = 0;

function step(label) {
    currentStep += 1;
    console.log(`[${currentStep}/${TOTAL_STEPS}] ${label}`);
}

function check(label) {
    console.log(`  \x1b[32m✓\x1b[0m ${label}`);
}

function log(msg) {
    console.log(`  ${msg}`);
}

function error(msg) {
    console.error(`\x1b[31m✗\x1b[0m ${msg}`);
}

function getVersion() {
    try {
        return JSON.parse(fs.readFileSync(path.join(ROOT_DIR, 'package.json'), 'utf-8')).version || 'unknown';
    } catch {
        return 'unknown';
    }
}

function run(cmd, opts = {}, deps = {}) {
    const execFn = deps.execSync || execSync;
    const capture = opts.capture !== false;
    const stdioConfig = capture ? ['pipe', 'pipe', 'pipe'] : 'inherit';
    try {
        const result = execFn(cmd, { encoding: 'utf-8', stdio: stdioConfig, ...opts });
        return result;
    } catch (err) {
        if (!capture) {
            error(`Command failed: ${cmd}`);
        }
        throw err;
    }
}

function findPython(options = {}) {
    const execFn = options.execSync || execSync;
    const isWin = typeof options.isWin === 'boolean' ? options.isWin : IS_WIN;
    const candidates = options.candidates || (isWin
        ? ['python', 'python3', 'py']
        : ['python3', 'python']);
    const exitFn = options.exit || process.exit;

    for (const cmd of candidates) {
        try {
            const output = execFn(`${cmd} --version`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
            const match = output.match(/Python (\d+)\.(\d+)/);
            if (match) {
                const major = parseInt(match[1], 10);
                const minor = parseInt(match[2], 10);
                if (major > 3 || (major === 3 && minor >= 9)) {
                    return cmd;
                } else {
                    error(`Found ${cmd} (Python ${major}.${minor}) but need >= 3.9`);
                    exitFn(1);
                }
            }
        } catch {
            continue;
        }
    }
    error('Python not found. Please install Python >= 3.9 and ensure it is on your PATH.');
    exitFn(1);
}

function parsePipOutput(output) {
    // Extract successfully installed packages from pip output
    const installed = [];
    const lines = (output || '').split('\n');
    for (const line of lines) {
        const match = line.match(/^Successfully installed (.+)$/);
        if (match) {
            const pkgs = match[1].split(/\s+/);
            for (const pkg of pkgs) {
                const name = pkg.split('-').slice(0, -1).join('-') || pkg;
                if (name && !installed.includes(name)) {
                    installed.push(name);
                }
            }
        }
    }
    return installed;
}

function installSkill(fsImpl, logFn, errorFn, srcDir, destDir) {
    const skillFile = path.join(srcDir, 'SKILL.md');
    const destFile = path.join(destDir, 'SKILL.md');

    if (!fsImpl.existsSync(skillFile)) {
        logFn(`Skill file not found at ${skillFile}, skipping global install`);
        return false;
    }

    try {
        fsImpl.mkdirSync(destDir, { recursive: true });
        const content = fsImpl.readFileSync(skillFile, 'utf8');
        const existing = fsImpl.existsSync(destFile) ? fsImpl.readFileSync(destFile, 'utf8') : '';

        if (existing === content) {
            logFn('AI skill already up to date');
            return true;
        }

        fsImpl.writeFileSync(destFile, content, 'utf8');
        return true;
    } catch (err) {
        errorFn(`Failed to install skill: ${err.message}`);
        return false;
    }
}

function main(options = {}) {
    const fsImpl = options.fs || fs;
    const logFn = options.log || log;
    const errorFn = options.error || error;
    const findPythonFn = options.findPython || findPython;
    const exitFn = options.exit || process.exit;
    const isWin = typeof options.isWin === 'boolean' ? options.isWin : IS_WIN;
    const paths = options.paths || {};
    const venvDir = paths.venvDir || VENV_DIR;
    const requirements = paths.requirements || REQUIREMENTS;
    const pythonBinPath = paths.pythonBin || (
        isWin
            ? path.join(venvDir, 'Scripts', 'python.exe')
            : path.join(venvDir, 'bin', 'python')
    );
    const pipPath = paths.pipPath || (
        isWin
            ? path.join(venvDir, 'Scripts', 'pip.exe')
            : path.join(venvDir, 'bin', 'pip')
    );
    const skillSrc = paths.skillSrc || SKILL_SRC;
    const skillDest = paths.skillDest || SKILL_DEST;
    const stepFn = options.step || step;
    const checkFn = options.check || check;

    const exec = options.execSync || execSync;
    const version = getVersion();

    // Banner
    console.log('');
    console.log(`  \x1b[1;36mTurboIndex\x1b[0m v${version} — Local codebase vector search`);
    console.log('');

    // Step 1: Node.js check
    stepFn('Checking Node.js');
    const nodeMajor = parseInt(process.version.slice(1).split('.')[0], 10);
    if (nodeMajor >= 18) {
        checkFn(`Node.js ${process.version}`);
    } else {
        error(`Node.js ${process.version} found, but >= 18 is required`);
        exitFn(1);
    }

    // Step 2: Python check
    stepFn('Finding Python');
    const pythonCmd = findPythonFn({ isWin, execSync: exec });
    const pythonVersion = exec(`${pythonCmd} --version`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
    checkFn(`${pythonVersion}`);

    // Step 3: Virtual environment
    stepFn('Creating virtual environment');
    if (!fsImpl.existsSync(venvDir)) {
        logFn('Running python -m venv...');
        try {
            const runFn = options.run || run;
            runFn(`${pythonCmd} -m venv "${venvDir}"`);
        } catch (e) {
            errorFn('Failed to create virtual environment');
            exitFn(1);
        }
        checkFn('.venv created');
    } else {
        checkFn('.venv already exists');
    }

    // Locate pip
    if (!fsImpl.existsSync(pipPath)) {
        errorFn(`pip not found at ${pipPath}`);
        exitFn(1);
    }

    // Step 4: Install Python dependencies
    stepFn('Installing Python dependencies');
    if (fsImpl.existsSync(requirements)) {
        try {
            const pipOutput = exec(`"${pipPath}" install -r "${requirements}"`, {
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe'],
            });
            const pipErr = pipOutput.stderr || '';
            const pipOut = pipOutput.stdout || pipOutput;
            const installed = parsePipOutput(pipOut);
            const keyPkgs = ['fastembed', 'turbovec', 'fastmcp', 'numpy', 'pathspec'];
            const shown = installed.filter(p => keyPkgs.some(k => p.includes(k)));
            if (shown.length > 0) {
                checkFn(shown.join(', '));
            } else if (installed.length > 0) {
                checkFn(`${installed.length} packages`);
            } else {
                checkFn('dependencies installed');
            }
        } catch (e) {
            errorFn('pip install failed. Check your Python installation.');
            if (e.stdout) errorFn(e.stdout.toString().split('\n').slice(-3).join('\n'));
            if (e.stderr) errorFn(e.stderr.toString().split('\n').slice(-3).join('\n'));
            exitFn(1);
        }
    } else {
        logFn('requirements.txt not found, installing default packages...');
        try {
            exec(`"${pipPath}" install fastmcp turbovec fastembed numpy pathspec`, {
                encoding: 'utf-8',
                stdio: ['pipe', 'pipe', 'pipe'],
            });
        } catch (e) {
            errorFn('pip install failed');
            exitFn(1);
        }
        checkFn('core packages installed');
    }

    // Step 5: AI skill
    stepFn('Installing AI skill');
    const skillOk = installSkill(fsImpl, logFn, errorFn, skillSrc, skillDest);
    if (skillOk) {
        checkFn('turboindex skill ready');
    }

    // Verify
    if (!fsImpl.existsSync(pythonBinPath)) {
        errorFn('Python environment not found after setup.');
        exitFn(1);
    }

    // Post-install instructions
    console.log('');
    console.log('  \x1b[1;32mTurboIndex is ready!\x1b[0m');
    console.log('');
    console.log('  Add this to your MCP client config:');
    console.log('');
    console.log('  \x1b[2m{\x1b[0m');
    console.log('  \x1b[2m  "mcpServers": {\x1b[0m');
    console.log('  \x1b[2m    "turboindex": {\x1b[0m');
    console.log('  \x1b[2m      "command": "turboindex",\x1b[0m');
    console.log('  \x1b[2m      "cwd": "."\x1b[0m');
    console.log('  \x1b[2m    }\x1b[0m');
    console.log('  \x1b[2m  }\x1b[0m');
    console.log('  \x1b[2m}\x1b[0m');
    console.log('');
    console.log('  \x1b[2mRun `turboindex --help` for options.\x1b[0m');
    console.log('');
}

if (require.main === module) {
    main();
}

module.exports = {
    installSkill,
    main,
    run,
    findPython,
    log,
    error,
    step,
    check,
    getVersion,
    parsePipOutput,
    ROOT_DIR,
    VENV_DIR,
    SKILL_SRC,
    SKILL_DEST,
    REQUIREMENTS,
    IS_WIN,
    TOTAL_STEPS,
};
