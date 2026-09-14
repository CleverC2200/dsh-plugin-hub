export type HostVersions = {
    dsh: string;
    workbench: string;
    desktop: string;
};
export type Release = {
    package: string;
    version: string;
    url: string;
    sha256: string;
    notes: {
        zh: string;
        en: string;
    };
    compatible: {
        [K in keyof HostVersions]: string[];
    };
};
export type ReleaseChannel = {
    schema: 1;
    channel: 'stable' | 'test';
    releases: Release[];
};
export declare function validateReleaseChannel(value: unknown, channel: string, host: HostVersions): ReleaseChannel;
/** Authentication is caller-owned; it is sent only to the GitHub API, never to redirects. */
export declare function downloadRelease(url: string, { token, signal, accept, maxBytes }?: {
    token?: string;
    signal?: AbortSignal;
    accept?: string;
    maxBytes?: number;
}): Promise<Uint8Array>;
export declare function fetchReleasePackage(release: Release, options?: Parameters<typeof downloadRelease>[1]): Promise<Uint8Array>;
/** A client must never accept different bytes for a version it has already observed. */
export declare function verifyReleaseHistory(channel: ReleaseChannel, previous: Record<string, string>): Record<string, string>;
/** A channel tag points to a mutable channel JSON, never mutable package bytes. */
export declare function fetchCompanyChannel(tagUrl: string, channel: 'stable' | 'test', host: HostVersions, options?: Parameters<typeof downloadRelease>[1]): Promise<ReleaseChannel>;
