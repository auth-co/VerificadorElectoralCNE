import Checkbox from '../Checkbox';
import StepBadge from '../StepBadge';

interface TabComparacionAutomaticaProps {
  checkMigaPan: boolean;
  onCheckMigaPan: (v: boolean) => void;
  onMostrarGuiaDrive: () => void;
  onAbrirDrive: () => void;
  onContinuar: () => void;
}

export default function TabComparacionAutomatica({
  checkMigaPan, onCheckMigaPan, onMostrarGuiaDrive, onAbrirDrive, onContinuar
}: TabComparacionAutomaticaProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-10 animate-fadeIn max-w-[1100px] mx-auto">
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ff5a5a] flex items-center justify-center flex-shrink-0">
              <span className="font-['Poppins',sans-serif] font-bold text-white text-xl">1.</span>
            </div>
            <p className="font-['Poppins',sans-serif] font-semibold text-[#ff5a5a] text-lg leading-relaxed mt-1">
              Indícale al líder que ya se encuentran los documentos en el DRIVE, para realizar el proceso de comparación automática.
            </p>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-[#ff5a5a] flex items-center justify-center flex-shrink-0">
              <span className="font-['Poppins',sans-serif] font-bold text-white text-xl">2.</span>
            </div>
            <div>
              <p className="font-['Poppins',sans-serif] text-[#ff5a5a] text-lg leading-relaxed">
                El líder subirá al drive el archivo
              </p>
              <p className="font-['Poppins',sans-serif] font-bold text-[#40376d] text-xl tracking-wide">
                resultados_e14_FINAL
              </p>
              <p className="font-['Poppins',sans-serif] font-semibold text-[#ff5a5a] text-lg leading-relaxed mt-3">
                Este es el archivo que debes &nbsp;usar en la fase de comparación manual:
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <StepBadge number={3} color="#ff5a5a" />
            <div>
              <p className="font-['Poppins',sans-serif] font-medium text-[#40376d] text-lg leading-relaxed">
                En drive, abre el documento con "hojas de calculo de google"
              </p>
              <button
                onClick={onMostrarGuiaDrive}
                className="font-['Poppins',sans-serif] text-[#11d0d0] text-base italic hover:text-[#0ab8b8] transition-colors cursor-pointer mt-1"
              >
                ¿Cómo abrir el doc en "hojas de cálculo de Google"?
              </button>
              <button
                onClick={onAbrirDrive}
                className="flex items-center gap-3 mt-4 w-full h-[52px] bg-white border-2 border-[#11d0d0] rounded-[8px] px-4 hover:bg-[#11d0d0]/10 transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                  <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                  <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                  <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                  <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                  <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                  <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 27h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                </svg>
                <span className="font-['Poppins',sans-serif] font-semibold text-[#40376d] text-base">
                  Abrir Google Drive
                </span>
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <p className="font-['Poppins',sans-serif] font-bold text-[#ff5a5a] text-sm tracking-wider leading-relaxed uppercase">
              SI YA CUENTAS CON LA SIGUIENTE INFORMACIÓN, PUEDES CONTINUAR A LA REVISIÓN EN CANCHA:
            </p>
            <div className="mt-5">
              <Checkbox
                checked={checkMigaPan}
                onChange={onCheckMigaPan}
                label='Archivo resultados_e14_FINAL abierto en "hojas de cálculo de Google"'
                accentColor="#ff5a5a"
              />
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={onContinuar}
              className="h-[53px] w-[226px] border-2 border-[#40376d] rounded-[8px] hover:bg-[#40376d] hover:text-white transition-colors cursor-pointer"
            >
              <span className="font-['Poppins',sans-serif] font-semibold text-[#40376d] text-2xl tracking-wider hover:text-white">
                CONTINUAR
              </span>
            </button>
          </div>
        </div>
      </div>

    </>
  );
}
