declare module 'download-crx' {
    interface DownloadOptions {
        filename?: string;
        filePath?: string;
    }

    function downloadCrx(extensionId: string, options?: DownloadOptions): Promise<string>;
    export default downloadCrx;
}

declare module 'unzip-crx-3' {
    function unzip(crxPath: string, destination: string): Promise<void>;
    export default unzip;
}
