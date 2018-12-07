'use strict';

import {
    window, languages, workspace,
    ExtensionContext, TextDocument,
    DocumentSelector, TextEditor,
    Hover
} from 'vscode';
import { DocumentParser } from './document-parser';
var fs = require('fs');

const NOTE_FILE_PATTERN: DocumentSelector = { language: 'Note', scheme: 'file' };
const documentParser: DocumentParser = new DocumentParser();

export function activate(context: ExtensionContext) {


    let disposableNoteHover = languages.registerHoverProvider(NOTE_FILE_PATTERN, { // 👍 only works with files on disk
        provideHover(doc: TextDocument) {
            const { size } = fs.statSync(doc.uri.fsPath);
            return new Hover(`Size in bytes is ${size}`);
        }
    });

    if (window.activeTextEditor) {
        triggerUpdateDecorations(window.activeTextEditor);
    }

    workspace.onDidChangeTextDocument(event => {
        if (window.activeTextEditor && event.document === window.activeTextEditor.document) {
            triggerUpdateDecorations(window.activeTextEditor);
        }
    }, null, context.subscriptions);
    window.onDidChangeActiveTextEditor(editor => {
        if (editor) {
            triggerUpdateDecorations(editor);
        }
    }, null, context.subscriptions);

    context.subscriptions.push(disposableNoteHover);
}

export function deactivate() {

}

function triggerUpdateDecorations(editor: TextEditor) {

    if (editor.document.languageId !== 'Note') {
        return;
    }

    let renderRanges = documentParser.parse(editor);
    editor.setDecorations(documentParser.tokens['!'].style, renderRanges['!']);
    editor.setDecorations(documentParser.tokens['|'].style, renderRanges['|']);
}

// TODO: registerFoldingRangeProvider(selector: DocumentSelector, provider: FoldingRangeProvider): Disposable

// TODO: registerHoverProvider(selector: DocumentSelector, provider: HoverProvider): Disposable