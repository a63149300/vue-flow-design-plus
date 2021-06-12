export declare class Resizable {
    private element;
    private options;
    private document;
    private callback;
    constructor(el: HTMLElement, options?: OptionsType, callback?: Function);
    setPosition(top: number, left: number): void;
    private createHandles;
    private createHandle;
    private getChilds;
    private resize;
    private getStyleByDirection;
}
export interface OptionsType {
    handles?: string[];
    threshold?: number;
    initSize?: ISize;
}
export interface ISize {
    maxWidth: number;
    maxHeight: number;
    minWidth: number;
    minHeight: number;
}
export interface ConfigType {
    baseX: number;
    baseY: number;
    width: string;
    height: string;
    x: number;
    y: number;
    offsetTop: number;
    offsetLeft: number;
}
