import { DecorationRenderOptions, OverviewRulerLane, DecorationOptions, TextEditorDecorationType, window, TextEditor, Range } from "vscode";
import { TokenDescription } from "./token/token-details";

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

export class DocumentParser { 
    
    readonly tokens: { [id: string]: TokenDescription } = {
        '!': {
            description: 'Exclamation', isOpening: true,
            style: window.createTextEditorDecorationType({ backgroundColor: 'crimson' })
        },
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
                }
            })
        }
    };
    private renderRanges: { [id: string]: DecorationOptions[] } = {
    '!': [],
    '|': []
};
    parse(editor: TextEditor): { [id: string]: DecorationOptions[] } {
        // TODO: rework to automatical generation 
        this.renderRanges = {
            '!': [],
            '|': []
        };
        this.tokens['!'].isOpening = true;
        this.tokens['|'].isOpening = true;

        let expression = /(\!|\|)/g;

        const text = editor.document.getText();
        let match: RegExpExecArray | null;
        while (match = expression.exec(text)) {
            let tokenValue = match[0];
            let token = this.tokens[tokenValue];
            if (token.isOpening) {
                token.position = match.index;
            }
            else {
                let start = editor.document.positionAt(token.position!);
                let end = editor.document.positionAt(match.index + tokenValue.length);

                let range: DecorationOptions = { range: new Range(start, end) };

                this.renderRanges[tokenValue].push(range);
            }
            token.isOpening = !token.isOpening;
        }

        return this.renderRanges;
    }
}

/** Recursion version */

// let selections: TextSection[] = [];
// let currentDoc: TextDocument;
// export function parseDocument(document: TextDocument): TextSection[] { 
//     currentDoc = document;
//     let text = currentDoc.getText();
//     clearFlags();
//     selections = [];
//     findToken(text);
//     return selections;
// }
// /** flags **/
// let isImportantOpened: boolean;
// let isWarningOpened: boolean;
// let isInformationOpened: boolean;
// let isSelectionOpened: boolean;


// function clearFlags() {
//     isImportantOpened = false;
//     isWarningOpened = false;
//     isInformationOpened = false;
//     isSelectionOpened = false;
// }
// function findToken(text: string, from: number = 0): number {
//     for (let i = from; i < text.length; i++) {
//         if (text[i] === '!') {
//             if (isImportantOpened) { 
//                 isImportantOpened = false;
//                 return i;
//             } 
//             isImportantOpened = true;
//             let startPos = currentDoc.positionAt(i);
//             i = findToken(text, i + 1) + 1;

//             if(!i) {
//                 return -1;
//             }

//             let endPos = currentDoc.positionAt(i);

//             let style = window.createTextEditorDecorationType(Styles['important']);
//             let range: DecorationOptions = { range: new Range(startPos, endPos) };
//             selections.push({ decoration: style, option: range });
//         }
//     }
//     return -1;
// }