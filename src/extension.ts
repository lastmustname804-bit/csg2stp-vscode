import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { spawn } from 'child_process';

let statusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {
    statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.command = 'csg2stp.exportStep';
    statusBarItem.text = '$(arrow-up) Export STEP';
    statusBarItem.tooltip = 'Export current OpenSCAD file to STEP via csg2stp';
    context.subscriptions.push(statusBarItem);

    const updateStatusBar = () => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document.fileName.endsWith('.scad')) {
            statusBarItem.show();
        } else {
            statusBarItem.hide();
        }
    };

    context.subscriptions.push(
        vscode.window.onDidChangeActiveTextEditor(updateStatusBar),
        vscode.workspace.onDidOpenTextDocument(updateStatusBar)
    );
    updateStatusBar();

    const cmd = vscode.commands.registerCommand('csg2stp.exportStep', () => exportStep());
    context.subscriptions.push(cmd);
}

async function exportStep() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        vscode.window.showErrorMessage('csg2stp: No active editor.');
        return;
    }

    const scadPath = editor.document.fileName;
    if (!scadPath.endsWith('.scad')) {
        vscode.window.showErrorMessage('csg2stp: Active file is not a .scad file.');
        return;
    }

    const config = vscode.workspace.getConfiguration('csg2stp');
    const executablePath = config.get<string>('executablePath', '').trim();
    if (!executablePath) {
        const open = 'Open Settings';
        const choice = await vscode.window.showErrorMessage(
            'csg2stp: Executable path is not configured. Set "csg2stp.executablePath" in settings.',
            open
        );
        if (choice === open) {
            vscode.commands.executeCommand('workbench.action.openSettings', 'csg2stp.executablePath');
        }
        return;
    }

    if (!fs.existsSync(executablePath)) {
        vscode.window.showErrorMessage(`csg2stp: Executable not found: ${executablePath}`);
        return;
    }

    // Suggest output path: same dir as .scad, but in a sibling "stp" folder, same base name
    const scadDir = path.dirname(scadPath);
    const baseName = path.basename(scadPath, '.scad');
    const defaultOutDir = path.join(scadDir, 'stp');
    const defaultOutPath = path.join(defaultOutDir, baseName + '.stp');

    const outUri = await vscode.window.showSaveDialog({
        defaultUri: vscode.Uri.file(defaultOutPath),
        filters: { 'STEP Files': ['stp', 'step'] },
        title: 'Save STEP file',
        saveLabel: 'Export'
    });

    if (!outUri) {
        return; // user cancelled
    }

    const outputPath = outUri.fsPath;

    // csg2stp writes <baseName>.stp next to the .scad file
    const generatedStp = path.join(scadDir, baseName + '.stp');

    statusBarItem.text = '$(sync~spin) Exporting…';
    statusBarItem.tooltip = 'csg2stp is running…';

    try {
        await runCsg2stp(executablePath, scadPath);
    } catch (err) {
        statusBarItem.text = '$(arrow-up) Export STEP';
        statusBarItem.tooltip = 'Export current OpenSCAD file to STEP via csg2stp';
        vscode.window.showErrorMessage(`csg2stp failed: ${err}`);
        return;
    }

    // Move generated file to the user-chosen destination
    try {
        if (!fs.existsSync(generatedStp)) {
            throw new Error(`Expected output not found: ${generatedStp}`);
        }
        const outDir = path.dirname(outputPath);
        if (!fs.existsSync(outDir)) {
            fs.mkdirSync(outDir, { recursive: true });
        }
        fs.copyFileSync(generatedStp, outputPath);
        fs.unlinkSync(generatedStp);
    } catch (err) {
        statusBarItem.text = '$(arrow-up) Export STEP';
        statusBarItem.tooltip = 'Export current OpenSCAD file to STEP via csg2stp';
        vscode.window.showErrorMessage(`csg2stp: Could not move output file: ${err}`);
        return;
    }

    statusBarItem.text = '$(check) STEP exported';
    statusBarItem.tooltip = `Exported to ${outputPath}`;
    setTimeout(() => {
        statusBarItem.text = '$(arrow-up) Export STEP';
        statusBarItem.tooltip = 'Export current OpenSCAD file to STEP via csg2stp';
    }, 4000);

    const open = 'Show in Explorer';
    const choice = await vscode.window.showInformationMessage(
        `STEP exported: ${outputPath}`,
        open
    );
    if (choice === open) {
        vscode.commands.executeCommand('revealFileInOS', vscode.Uri.file(outputPath));
    }
}

function runCsg2stp(executable: string, scadPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // On Windows, .bat / .cmd files must be launched via cmd.exe
        const isWindows = process.platform === 'win32';
        const isBatchFile = /\.(bat|cmd)$/i.test(executable);

        let child;
        if (isWindows && isBatchFile) {
            child = spawn('cmd.exe', ['/c', executable, scadPath], { windowsHide: true });
        } else {
            child = spawn(executable, [scadPath], { windowsHide: true });
        }

        const stderr: string[] = [];
        const stdout: string[] = [];
        child.stdout?.on('data', (d: Buffer) => stdout.push(d.toString()));
        child.stderr?.on('data', (d: Buffer) => stderr.push(d.toString()));

        child.on('error', (err) => reject(err.message));
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                const msg = stderr.join('').trim() || stdout.join('').trim() || `exit code ${code}`;
                reject(msg);
            }
        });
    });
}

export function deactivate() {
    statusBarItem?.dispose();
}
