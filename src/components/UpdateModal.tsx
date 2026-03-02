interface UpdateModalProps {
  available: string | null;
  progress: number | null;
  ready: boolean;
  updateError: string | null;
  canRetry: boolean;
  dismissed: boolean;
  onDownload: () => void;
  onInstall: () => void;
  onManualDownload: () => void;
  onDismiss: () => void;
}

export default function UpdateModal({
  available, progress, ready, updateError, canRetry,
  dismissed, onDownload, onInstall, onManualDownload, onDismiss
}: UpdateModalProps) {
  const isDownloading = progress !== null;
  const visible = (available || isDownloading || ready || updateError) && !dismissed;

  if (!visible) return null;

  const getTitle = () => {
    if (ready)          return '¡Actualización lista!';
    if (isDownloading)  return 'Descargando actualización...';
    if (updateError)    return 'Error al descargar';
    return 'Nueva versión disponible';
  };

  const getSubtitle = () => {
    if (ready)          return 'La nueva versión ya está instalada. Reinicia para aplicarla.';
    if (isDownloading)  return 'No cierres la aplicación. Este proceso puede tardar unos minutos.';
    if (updateError)    return 'No se pudo descargar la actualización automáticamente.';
    return `La versión ${available} está disponible con mejoras y correcciones importantes.`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#1a1333]/75 backdrop-blur-sm" />

      {/* Card */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[420px] mx-4 overflow-hidden">

        {/* Header band */}
        <div className={`h-2 w-full ${ready ? 'bg-[#00c853]' : updateError ? 'bg-[#ff5a5a]' : 'bg-[#11d0d0]'}`} />

        <div className="px-8 py-7">

          {/* Icon */}
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5 ${
            ready ? 'bg-[#00c853]/15' : updateError ? 'bg-[#ff5a5a]/15' : 'bg-[#11d0d0]/15'
          }`}>
            {ready ? (
              <svg className="w-7 h-7 text-[#00c853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : updateError ? (
              <svg className="w-7 h-7 text-[#ff5a5a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            ) : isDownloading ? (
              <svg className="w-7 h-7 text-[#11d0d0] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-7 h-7 text-[#11d0d0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
          </div>

          {/* Version badge */}
          {available && !ready && (
            <div className="flex justify-center mb-3">
              <span className="bg-[#40376d] text-white text-xs font-['Poppins',sans-serif] font-semibold px-3 py-1 rounded-full tracking-wider">
                v{available}
              </span>
            </div>
          )}

          {/* Title */}
          <h2 className={`font-['Poppins',sans-serif] font-bold text-xl text-center mb-2 ${
            ready ? 'text-[#00c853]' : updateError ? 'text-[#ff5a5a]' : 'text-[#40376d]'
          }`}>
            {getTitle()}
          </h2>

          {/* Subtitle */}
          <p className="font-['Poppins',sans-serif] text-sm text-[#666] text-center leading-relaxed mb-6">
            {getSubtitle()}
          </p>

          {/* Error detail */}
          {updateError && (
            <div className="bg-[#fff5f5] border border-[#ff5a5a]/30 rounded-lg px-4 py-3 mb-5">
              <p className="font-mono text-xs text-[#ff5a5a] break-all leading-relaxed">{updateError}</p>
            </div>
          )}

          {/* Progress bar */}
          {isDownloading && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-['Poppins',sans-serif] text-xs text-[#888]">Progreso</span>
                <span className="font-['Poppins',sans-serif] text-xs font-semibold text-[#11d0d0]">
                  {progress! >= 100 ? 'Verificando...' : `${progress}%`}
                </span>
              </div>
              <div className="w-full bg-[#f0f0f0] rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    progress! >= 100 ? 'bg-[#00c853] animate-pulse' : 'bg-[#11d0d0]'
                  }`}
                  style={{ width: `${Math.min(progress!, 100)}%` }}
                />
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col gap-3">

            {/* Primary action */}
            {ready && (
              <button
                onClick={onInstall}
                className="w-full h-12 bg-[#00c853] hover:bg-[#00b248] rounded-xl font-['Poppins',sans-serif] font-bold text-white text-base transition-colors"
              >
                REINICIAR Y ACTUALIZAR
              </button>
            )}

            {!ready && !isDownloading && !updateError && (
              <button
                onClick={onDownload}
                className="w-full h-12 bg-[#11d0d0] hover:bg-[#0fb8b8] rounded-xl font-['Poppins',sans-serif] font-bold text-white text-base transition-colors shadow-md shadow-[#11d0d0]/30"
              >
                ACTUALIZAR AHORA
              </button>
            )}

            {updateError && (
              <div className="flex gap-2">
                {canRetry && (
                  <button
                    onClick={onDownload}
                    className="flex-1 h-11 bg-[#11d0d0] hover:bg-[#0fb8b8] rounded-xl font-['Poppins',sans-serif] font-semibold text-white text-sm transition-colors"
                  >
                    Reintentar
                  </button>
                )}
                <button
                  onClick={onManualDownload}
                  className="flex-1 h-11 bg-[#40376d] hover:bg-[#322d60] rounded-xl font-['Poppins',sans-serif] font-semibold text-white text-sm transition-colors"
                >
                  Descarga manual
                </button>
              </div>
            )}

            {/* Cancel / dismiss — siempre visible salvo mientras descarga */}
            {!isDownloading && (
              <button
                onClick={onDismiss}
                className="w-full py-2 font-['Poppins',sans-serif] text-sm text-[#aaa] hover:text-[#888] transition-colors"
              >
                {ready ? 'Más tarde' : 'Cancelar por ahora'}
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
