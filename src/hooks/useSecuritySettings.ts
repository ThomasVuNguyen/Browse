import { useEffect, useState } from 'react';

const STORAGE_KEY = 'ignore-cert-errors';

export function useSecuritySettings() {
    const [ignoreCertErrors, setIgnoreCertErrors] = useState<boolean>(() => {
        return localStorage.getItem(STORAGE_KEY) === 'true';
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, String(ignoreCertErrors));
        if (window.electron?.security?.setIgnoreCertificateErrors) {
            window.electron.security.setIgnoreCertificateErrors(ignoreCertErrors);
        }
    }, [ignoreCertErrors]);

    return {
        ignoreCertErrors,
        setIgnoreCertErrors,
    };
}
