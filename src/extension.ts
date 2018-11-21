'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
    commands, window, languages,
    ExtensionContext, CancellationToken, ProviderResult,
    TextDocument, Position, DocumentHighlight, TextLine, Range,
    DocumentHighlightProvider, 
    Hover,
    DocumentSelector,
    DecorationOptions} from 'vscode';

var fs = require('fs');

const NOTE_FILE_PATTERN: DocumentSelector = { language: 'Note', scheme: 'file' };


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "plaguenotes" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        window.showInformationMessage('Hello World!');
    });


    let disposableNoteHover = languages.registerHoverProvider(NOTE_FILE_PATTERN, { // 👍 only works with files on disk
        provideHover(doc: TextDocument) {
            const { size } = fs.statSync(doc.uri.fsPath);
            return new Hover(`Size in bytes is ${size}`);
        }
    });

    // let disposableNoteHighliter = languages.registerDocumentHighlightProvider(
    //     NOTE_FILE_PATTERN, {
    //     provideDocumentHighlights(document: TextDocument, position: Position, token: CancellationToken): DocumentHighlight[] {

    //     }
    //     });

    let disposableNote = commands.registerCommand('extension.generateNote', () => { 
        //vscode.window.
    });


    window.onDidChangeActiveTextEditor(editor => {
        triggerUpdateDecorations();
    }, null, context.subscriptions);


    context.subscriptions.push(disposable);
    context.subscriptions.push(disposableNote);
    //context.subscriptions.push(disposableNoteHighliter);
    context.subscriptions.push(disposableNoteHover);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function triggerUpdateDecorations() {
    if (!window.activeTextEditor) { 
        return;
    }

    let document = window.activeTextEditor.document;
    let highlight: DecorationOptions = { range: new Range(new Position(0, 0), new Position(document.lineCount, 0)) };
    let res: DecorationOptions[] = [highlight];
    let style = window.createTextEditorDecorationType({ backgroundColor: 'crimson', borderColor: 'green', isWholeLine: true, borderWidth: '2px'});

    window.activeTextEditor.setDecorations(style, res);
}

// TODO: registerFoldingRangeProvider(selector: DocumentSelector, provider: FoldingRangeProvider): Disposable

// TODO: registerHoverProvider(selector: DocumentSelector, provider: HoverProvider): Disposable