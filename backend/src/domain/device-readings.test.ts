import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { deviceSampleSchema, hashDeviceValue, matchesDeviceSecret, newDeviceSecret, normalizeDeviceSample, sustainedState } from './device-readings.js';
import { classifyReading } from './readings.js';

const sample = { sampleId: randomUUID(), timestamp: new Date().toISOString(), heartRate: 75, temperature: 36.5, contactDetected: true, signalQuality: 'GOOD' as const };
const limits = { heartRateMinimum: 50, heartRateMaximum: 120, temperatureMinimum: 35, temperatureMaximum: 38 };
const rows = (values: number[]) => values.map((heartRate, index) => ({ ...normalizeDeviceSample({ ...sample, heartRate }), timestamp: new Date(Date.now() - index * 5000) }));

test('device: credential is random, hashed and cannot authenticate with wrong secret', () => {
  const secret = newDeviceSecret();
  assert.equal(secret.length, 64);
  assert.notEqual(secret, newDeviceSecret());
  assert.ok(matchesDeviceSecret(secret, hashDeviceValue(secret)));
  assert.ok(!matchesDeviceSecret(newDeviceSecret(), hashDeviceValue(secret)));
  assert.ok(!matchesDeviceSecret(secret, null));
  assert.ok(!matchesDeviceSecret(secret, 'malformed'));
});
test('device: schema refuses user id, source spoofing and non-numeric readings', () => {
  for (const extra of [{ elderId: randomUUID() }, { source: 'SIMULATOR' }, { heartRate: '80' }, { temperature: Infinity }, { sampleId: '123' }]) {
    assert.equal(deviceSampleSchema.safeParse({ ...sample, ...extra }).success, false);
  }
});
test('device: no contact / poor quality / impossible values never become valid measurements', () => {
  for (const extra of [{ contactDetected: false }, { signalQuality: 'POOR' as const }, { heartRate: 290 }, { temperature: 70 }, { heartRate: null, temperature: null }]) {
    const normalized = normalizeDeviceSample({ ...sample, ...extra });
    assert.equal(normalized.valid, false);
    assert.equal(normalized.heartRate, null);
    assert.equal(normalized.temperature, null);
  }
});
test('device: only three same-direction samples over sufficient time confirm a violation', () => {
  assert.equal(sustainedState(rows([140, 140]), limits, 'HEART_RATE'), null);
  assert.equal(sustainedState(rows([140, 75, 140]), limits, 'HEART_RATE'), null);
  assert.equal(sustainedState(rows([140, 40, 140]), limits, 'HEART_RATE'), null);
  assert.equal(sustainedState(rows([140, 140, 140]), limits, 'HEART_RATE'), 'high');
  assert.equal(sustainedState(rows([40, 40, 40]), limits, 'HEART_RATE'), 'low');
  assert.equal(sustainedState(rows([75, 75, 75]), limits, 'HEART_RATE'), 'normal');
  assert.equal(sustainedState(rows([140, 140, 140]).map((r) => ({ ...r, timestamp: new Date() })), limits, 'HEART_RATE'), null);
  assert.equal(sustainedState(rows([140, 140, 140]).map((r, i) => ({ ...r, timestamp: new Date(Date.now() - i * 60_000) })), limits, 'HEART_RATE'), null);
  assert.equal(sustainedState(rows([140, 140, 140]).map((r, i) => ({ ...r, valid: i !== 1 })), limits, 'HEART_RATE'), null);
});
test('device: old readings no longer display normal status', () => {
  assert.equal(classifyReading({ ...rows([75])[0]!, timestamp: new Date(Date.now() - 100_000) }, limits), 'sem_sinal');
});
