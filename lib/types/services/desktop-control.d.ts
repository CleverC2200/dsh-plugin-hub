/** Bridge to the desktop owner. The browser never receives its private credential. */
export declare function hasDesktopOwner(): boolean;
export declare function desktopControl(action: string, body?: unknown): Promise<unknown>;
