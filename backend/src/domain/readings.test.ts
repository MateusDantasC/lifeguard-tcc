import assert from 'node:assert/strict';
import test from 'node:test';
import { classifyReading, findLimitViolations } from './readings.js';

const limits = {
  heartRateMinimum: 60,
  heartRateMaximum: 120,
  temperatureMinimum: 35.5,
  temperatureMaximum: 37.8,
};

test('classifica uma leitura normal', () => {
  assert.equal(classifyReading({ heartRate: 76, temperature: 36.4, valid: true, contactDetected: true }, limits), 'normal');
});

test('não transforma pico sem contato em alerta', () => {
  const reading = { heartRate: 220, temperature: 36.4, valid: false, contactDetected: false };
  assert.equal(classifyReading(reading, limits), 'sem_sinal');
  assert.deepEqual(findLimitViolations(reading, limits), []);
});

test('gera violação somente para medida válida fora do limite', () => {
  const violations = findLimitViolations(
    { heartRate: 132, temperature: 36.6, valid: true, contactDetected: true },
    limits,
  );
  assert.equal(violations.length, 1);
  assert.equal(violations[0]?.type, 'HEART_RATE');
});
