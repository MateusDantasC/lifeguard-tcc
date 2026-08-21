import { SignalQuality } from '../generated/prisma/enums.js';

export type SimulatedReading = {
  label: string;
  heartRate: number | null;
  temperature: number | null;
  signalQuality: SignalQuality;
  contactDetected: boolean;
  valid: boolean;
  invalidReason: string | null;
};

const sequence: SimulatedReading[] = [
  { label: 'normal', heartRate: 74, temperature: 36.4, signalQuality: SignalQuality.GOOD, contactDetected: true, valid: true, invalidReason: null },
  { label: 'normal', heartRate: 77, temperature: 36.5, signalQuality: SignalQuality.GOOD, contactDetected: true, valid: true, invalidReason: null },
  { label: 'normal', heartRate: 80, temperature: 36.5, signalQuality: SignalQuality.GOOD, contactDetected: true, valid: true, invalidReason: null },
  { label: 'atenção', heartRate: 113, temperature: 37.5, signalQuality: SignalQuality.FAIR, contactDetected: true, valid: true, invalidReason: null },
  { label: 'alerta válido', heartRate: 132, temperature: 37.6, signalQuality: SignalQuality.GOOD, contactDetected: true, valid: true, invalidReason: null },
  { label: 'recuperação', heartRate: 98, temperature: 37.2, signalQuality: SignalQuality.GOOD, contactDetected: true, valid: true, invalidReason: null },
  { label: 'sem contato', heartRate: null, temperature: 36.8, signalQuality: SignalQuality.NO_CONTACT, contactDetected: false, valid: false, invalidReason: 'Sensor de pulso sem contato.' },
  { label: 'pico inválido', heartRate: 224, temperature: 36.8, signalQuality: SignalQuality.POOR, contactDetected: false, valid: false, invalidReason: 'Pico descartado após perda de contato.' },
  { label: 'normal', heartRate: 78, temperature: 36.6, signalQuality: SignalQuality.GOOD, contactDetected: true, valid: true, invalidReason: null },
];

export function getSimulatedReading(index: number) {
  return sequence[index % sequence.length]!;
}
