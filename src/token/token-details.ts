import { DecorationRenderOptions, TextEditorDecorationType } from "vscode";

export interface TokenDescription {
    // readonly id: string;
    readonly description: string;
    isOpening: boolean;
    position?: number;
    style: TextEditorDecorationType;
}