import { aiClient } from './api';

export const getAiStatus = () => aiClient.get('/ai/status').then((r) => r.data);
export const runAi = (action, { text = '', title = '' } = {}) =>
  aiClient.post('/ai', { action, text, title }).then((r) => r.data);
export const chatAi = (messages, context) =>
  aiClient.post('/ai', { action: 'chat', messages, context }).then((r) => r.data);

// Practical English check: flags text with many non-Latin letters.
export const looksNonEnglish = (s) => {
  const letters = s.match(/\p{L}/gu) || [];
  if (letters.length < 8) return false;
  return letters.filter((c) => !/[A-Za-z]/.test(c)).length / letters.length > 0.2;
};
