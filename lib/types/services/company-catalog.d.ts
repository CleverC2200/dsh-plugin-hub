/** List and statistics share one source; unknown locales fall back to Chinese. */
export declare function companyCatalog(stats: boolean, lang?: string): unknown;
/** Catalog actions only accept a listed repository with completed distribution. */
export declare function companyInstallable(repo: string): boolean;
