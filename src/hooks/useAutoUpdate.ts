import { useState, useEffect } from 'react';
import { URL_RELEASES } from '../constants';

const MAX_DOWNLOAD_ATTEMPTS = 3;

export function useAutoUpdate() {
  const [available, setAvailable] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [downloadAttempts, setDownloadAttempts] = useState(0);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!window.electronAPI?.onUpdateAvailable) return;

    window.electronAPI.onUpdateAvailable((data) => {
      setAvailable(data.version);
      setUpdateError(null);
      setDownloadAttempts(0);
      setDismissed(false); // nueva versión detectada → mostrar siempre
    });

    window.electronAPI.onUpdateProgress((data) => {
      setProgress(data.percent);
      setUpdateError(null);
      setDismissed(false); // descarga en curso → no ocultar
    });

    window.electronAPI.onUpdateDownloaded(() => {
      setReady(true);
      setProgress(null);
      setDismissed(false); // listo para instalar → siempre mostrar
    });

    window.electronAPI.onUpdateError?.((data) => {
      setUpdateError(data.message);
      setProgress(null);
      setDismissed(false); // error → mostrar para que el usuario vea
    });

    return () => {
      window.electronAPI?.removeUpdateListeners();
    };
  }, []);

  const download = async () => {
    setDownloadAttempts(c => c + 1);
    setUpdateError(null);
    // El IPC solo dispara la descarga — no esperamos (el .exe pesa ~245MB).
    // El progreso y errores llegan por eventos (onUpdateProgress / onUpdateError).
    const result = await window.electronAPI?.descargarActualizacion();
    if (result && !result.success) {
      setUpdateError(result.error || 'No se pudo iniciar la descarga');
    }
  };

  const install = () => window.electronAPI?.instalarActualizacion();

  const openManualDownload = () => window.electronAPI?.abrirURL(URL_RELEASES);

  const dismiss = () => setDismissed(true);

  const canRetry = downloadAttempts < MAX_DOWNLOAD_ATTEMPTS;

  return { available, progress, ready, updateError, canRetry, dismissed, download, install, openManualDownload, dismiss };
}