import { DecorationRenderOptions, OverviewRulerLane, TextDocument, DecorationOptions, window, TextEditorDecorationType, Range, Position } from "vscode";

export interface TextSection { 
    decoration: TextEditorDecorationType;
    option: DecorationOptions;
}

export const Styles: { [index: string] : DecorationRenderOptions } = {
    important: { backgroundColor: 'blue' },
    warning:        { backgroundColor: 'lemon' },
    information:    { backgroundColor: 'lightblue' },
    selection:      { borderWidth: '1px', borderStyle: 'solid', borderColor: 'azure', overviewRulerColor: 'azure', overviewRulerLane: OverviewRulerLane.Right,}
};

let selections: TextSection[] = [];
let currentDoc: TextDocument;
export function parseDocument(document: TextDocument): TextSection[] { 
    currentDoc = document;
    let text = currentDoc.getText();
    clearFlags();
    selections = [];
    findToken(text);
    return selections;
}
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
function findToken(text: string, from: number = 0): number {
    for (let i = from; i < text.length; i++) {
        if (text[i] === '!') {
            if (isImportantOpened) { 
                isImportantOpened = false;
                return i;
            } 
            isImportantOpened = true;
            let startPos = currentDoc.positionAt(i);
            i = findToken(text, i + 1) + 1;

            if(!i) {
                return -1;
            }

            let endPos = currentDoc.positionAt(i);

            let style = window.createTextEditorDecorationType(Styles['important']);
            let range: DecorationOptions = { range: new Range(startPos, endPos) };
            selections.push({ decoration: style, option: range });
        }
    }
    return -1;
}