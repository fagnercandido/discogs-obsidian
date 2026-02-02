export const requestUrl = jest.fn();
export class Notice {
    constructor(public message: string, public duration?: number) { }
    setMessage = jest.fn();
    hide = jest.fn();
}
export class TFile { }
export const setIcon = jest.fn();
export class ItemView {
    constructor(public leaf: any) { }
    containerEl = {
        children: [null, { empty: jest.fn(), addClass: jest.fn(), createDiv: jest.fn() }]
    };
}
export class WorkspaceLeaf { }
export class Plugin {
    constructor(public app: any, public manifest: any) { }
    loadData = jest.fn();
    saveData = jest.fn();
    addRibbonIcon = jest.fn();
    addCommand = jest.fn();
    addSettingTab = jest.fn();
    registerView = jest.fn();
}
export class PluginSettingTab {
    constructor(public app: any, public plugin: any) { }
}
export class Setting {
    constructor(public containerEl: HTMLElement) { }
    setName = jest.fn().mockReturnThis();
    setDesc = jest.fn().mockReturnThis();
    addText = jest.fn().mockReturnThis();
    addDropdown = jest.fn().mockReturnThis();
    addToggle = jest.fn().mockReturnThis();
    addButton = jest.fn().mockReturnThis();
    setPlaceholder = jest.fn().mockReturnThis();
    setValue = jest.fn().mockReturnThis();
    onChange = jest.fn().mockReturnThis();
    setButtonText = jest.fn().mockReturnThis();
    setWarning = jest.fn().mockReturnThis();
    onClick = jest.fn().mockReturnThis();
}
