import type { Seccion } from './types';

export const TAB_LABELS: Record<Seccion, string> = {
  informacion: 'PLAN DE JUEGO',
  identificacion: 'CANCHA Y ALINEACIÓN',
  extraccion: 'LECTURA DEL MARCADOR',
  comparacion_automatica: 'VAR AUTOMÁTICO',
  comparacion_archivos: 'REVISIÓN EN CABINA',
  comparacion_manual: 'REVISIÓN EN CANCHA'
};

export const ALL_TABS: Seccion[] = [
  'informacion', 'identificacion', 'extraccion',
  'comparacion_automatica', 'comparacion_archivos', 'comparacion_manual'
];

export const EXTRACTOR_TABS: Seccion[] = ['informacion', 'identificacion', 'extraccion', 'comparacion_automatica', 'comparacion_manual'];
export const COMPARADOR_TABS: Seccion[] = ['comparacion_archivos'];

export const TAB_COLORS: Record<Seccion, string> = {
  informacion: '#ffb700',
  identificacion: '#ffb700',
  extraccion: '#11d0d0',
  comparacion_automatica: '#ff5a5a',
  comparacion_archivos: '#ff5a5a',
  comparacion_manual: '#d3c4d1'
};

export const TAB_BG_CLASSES: Record<Seccion, string> = {
  informacion: 'bg-[#ffb700]',
  identificacion: 'bg-[#ffb700]',
  extraccion: 'bg-[#11d0d0]',
  comparacion_automatica: 'bg-[#ff5a5a]',
  comparacion_archivos: 'bg-[#ff5a5a]',
  comparacion_manual: 'bg-[#d3c4d1]'
};

export const URL_REGISTRADURIA = 'https://auth-co.github.io/redirect-registraduria/';
export const URL_RELEASES = (import.meta.env.VITE_RELEASES_URL as string) || 'https://github.com/auth-co/VerificadorElectoralCNE/releases/latest';

export const TIPOS_ELECCION = ['Senado', 'Camara', 'Consulta', 'CITREP'];

export function getVisibleTabs(tier: string): Seccion[] {
  if (tier === 'comparador') return COMPARADOR_TABS;
  return EXTRACTOR_TABS;
}
