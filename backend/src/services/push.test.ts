import assert from 'node:assert/strict';
import test from 'node:test';
import { acceptsNotificationCategory } from './push.js';

test('respeita a preferência de alertas de saúde', () => {
  const preferences = { notifyHealthAlerts: false, notifyLinkUpdates: true };
  assert.equal(acceptsNotificationCategory(preferences, 'health_alert'), false);
  assert.equal(acceptsNotificationCategory(preferences, 'link_update'), true);
});

test('avisos de sistema não podem ser bloqueados por categoria', () => {
  const preferences = { notifyHealthAlerts: false, notifyLinkUpdates: false };
  assert.equal(acceptsNotificationCategory(preferences, 'system'), true);
});
