'use strict';

import {
    commands, window, languages,
    ExtensionContext, TextDocument, Position, Range,
    Hover,
    DocumentSelector,
    DecorationOptions,
    workspace,
    OverviewRulerLane,
    TextEditor,
    DecorationRenderOptions} from 'vscode';

import * as parser from './document-parser';
import { TextSection } from './document-parser';
import { TokenDescription } from './token/token-details';

var fs = require('fs');

const NOTE_FILE_PATTERN: DocumentSelector = { language: 'Note', scheme: 'file' };
let timeout: NodeJS.Timer | null;

export function activate(context: ExtensionContext) {
    timeout = null;

    console.log('Congratulations, your extension "plaguenotes" is now active!');

    let disposableNoteHover = languages.registerHoverProvider(NOTE_FILE_PATTERN, { // 👍 only works with files on disk
        provideHover(doc: TextDocument) {
            const { size } = fs.statSync(doc.uri.fsPath);
            return new Hover(`Size in bytes is ${size}`);
        }
    });

    if (window.activeTextEditor) {
        triggerUpdateDecorations();
    }

    workspace.onDidChangeTextDocument(event => {
        if (window.activeTextEditor && event.document === window.activeTextEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);
    window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, context.subscriptions);


    //context.subscriptions.push(disposable);
    //context.subscriptions.push(disposableNote);
    //context.subscriptions.push(disposableNoteHighliter);
    context.subscriptions.push(disposableNoteHover);
}

// this method is called when your extension is deactivated
export function deactivate() {
}

function triggerUpdateDecorations() {
    timeout && clearTimeout(timeout);
    timeout = setTimeout(updateDecorations, 0);
}


function updateDecorations() {
    let activeEditor = window.activeTextEditor;
    if (!activeEditor) {
        return;
    }

    if (activeEditor.document.languageId !== 'Note') {
        return;
    }
    // const regEx = /(!)/g;
    // const text = activeEditor.document.getText();
    // const smallNumbers: DecorationOptions[] = [];
    // const largeNumbers: DecorationOptions[] = [];
    // let match;
    // while (match = regEx.exec(text)) {
    //     const startPos = activeEditor.document.positionAt(match.index);
    //     const endPos = activeEditor.document.positionAt(match.index + match[0].length);
    //     const decoration = { range: new Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
    //     if (match[0].length < 3) {
    //         smallNumbers.push(decoration);
    //     } else {
    //         largeNumbers.push(decoration);
    //     }
    // }

    //let decorations: TextSection[] = parseDocument(activeEditor);

    // clearFlags();
    // selections = [];
    // options = [];

    //findToken(text, activeEditor);

    findTokenFor();
    activeEditor.setDecorations(tokens['!'].style, renderRanges['!']);
    activeEditor.setDecorations(tokens['|'].style, renderRanges['|']);
    // let ttt = decorations[0].decoration;
    // let ttt1 = decorations.map(v => v.option);
    // activeEditor.setDecorations(ttt, ttt1);
    // if (!selections.length) {
    //     activeEditor.setDecorations(window.createTextEditorDecorationType(parser.Styles['important']), []);
    //     return;
    // }
    // activeEditor.setDecorations(window.createTextEditorDecorationType(parser.Styles['important']), options);
    
    // decorations.forEach(element => {
    //     // TODO: Add range to existiong decoration typ 
    //     activeEditor!.setDecorations(element.decoration, [element.option]);
    // });

    // activeEditor.setDecorations(exclStyle, smallNumbers);
    // activeEditor.setDecorations(largeNumberDecorationType, largeNumbers);
}

const smallNumberDecorationType = window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'solid',
    overviewRulerColor: 'blue',
    overviewRulerLane: OverviewRulerLane.Right,
    light: {
        // this color will be used in light color themes
        borderColor: 'darkblue'
    },
    dark: {
        // this color will be used in dark color themes
        borderColor: 'lightblue'
    }
});

// create a decorator type that we use to decorate large numbers
const largeNumberDecorationType = window.createTextEditorDecorationType({
    cursor: 'crosshair',
    // use a themable color. See package.json for the declaration and default values.
    backgroundColor: 'red'
});

// function updateDecorations1() {
//     let activeEditor =  window.activeTextEditor!;
//     let document = activeEditor.document;
//     if (document.languageId !== 'Note') {
//         return;
//     }

//     let decorations: TextSection[] = parser.parseDocument(document);
//     // let ttt = decorations[0].decoration;
//     // let ttt1 = decorations.map(v => v.option);
//     // activeEditor.setDecorations(ttt, ttt1);
//     if (!decorations.length) {
//         activeEditor.setDecorations(window.createTextEditorDecorationType(parser.Styles['important']), []);
//     }
//     decorations.forEach(element => {
//         // TODO: Add range to existiong decoration type
//         activeEditor.setDecorations(element.decoration, [element.option]);
//     });
// }
let selections: TextSection[] = [];
let options: DecorationOptions[] = [];


/** flags **/
let isImportantOpened: boolean;
let isWarningOpened: boolean;
let isInformationOpened: boolean;
let isSelectionOpened: boolean;


function clearFlags() {
    isImportantOpened = false;
    isWarningOpened = false;
    isInformationOpened = false;
    isSelectionOpened = false;
}

let renderRanges: { [id: string]: DecorationOptions[] } = {
    '!': [],
    '|': []
};

let tokens: { [id: string] : TokenDescription } = {
    '!': { description: 'Exclamation', isOpening: true, 
        style: window.createTextEditorDecorationType({ backgroundColor: 'crimson' }) },
    '|': {
        description: 'Exclamation', isOpening: true,
        style: window.createTextEditorDecorationType({
            borderWidth: '1px',
            borderStyle: 'solid',
            overviewRulerColor: 'blue',
            overviewRulerLane: OverviewRulerLane.Right,
            light: {
                // this color will be used in light color themes
                borderColor: 'darkblue'
            },
            dark: {
                // this color will be used in dark color themes
                borderColor: 'lightblue'
            } })
    }
};

function findTokenFor(): any {
    if(!window.activeTextEditor) {
        return [];
    }
    // TODO: rework
    renderRanges = {
        '!': [],
        '|': []
    };
    let activeEditor = window.activeTextEditor;
    let expression = /(\!|\|)/g;

    const text = activeEditor.document.getText();
    let match: RegExpExecArray | null;
    while (match = expression.exec(text)) {
        let tokenValue = match[0];
        let token = tokens[tokenValue];
        if (token.isOpening) {
            token.position = match.index;
        }
        else {
            let start = activeEditor.document.positionAt(token.position!);
            let end = activeEditor.document.positionAt(match.index + tokenValue.length);

            let range: DecorationOptions = { range: new Range(start, end) };

            renderRanges[tokenValue].push(range);
        }
        token.isOpening = !token.isOpening;
    }
}
function findToken(text: string, currentDoc: TextEditor, from: number = 0): number {
    for (let i = from; i < text.length; i++) {
        if (text[i] === '!') {
            if (isImportantOpened) {
                isImportantOpened = false;
                return i + 1;
            }
            isImportantOpened = true;
            let startPos = currentDoc.document.positionAt(i+ 1);
            let end = findToken(text, currentDoc, i + 1);

            if (end === -1) {
                return end;
            }
            i = end;
            let endPos = currentDoc.document.positionAt(end +1 );

            let style = window.createTextEditorDecorationType(parser.Styles['important']);
            let range: DecorationOptions = { range: new Range(startPos, endPos) };
            options.push(range);
            selections.push({ decoration: style, option: range });
        }
    }
    return -1;
}
// TODO: registerFoldingRangeProvider(selector: DocumentSelector, provider: FoldingRangeProvider): Disposable

// TODO: registerHoverProvider(selector: DocumentSelector, provider: HoverProvider): Disposable

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    // let disposable = commands.registerCommand('extension.sayHello', () => {
    //     // The code you place here will be executed every time your command is executed

    //     // Display a message box to the user
    //     window.showInformationMessage('Hello World!');
    // });