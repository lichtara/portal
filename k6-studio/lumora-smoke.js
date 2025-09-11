import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '30s',
};

const BASE = __ENV.BASE_URL || 'http://localhost:8000';

export default function () {
  const h = http.get(`${BASE}/health`);
  check(h, { 'health 200': (r) => r.status === 200 });

  const p = http.post(
    `${BASE}/run_proposal`,
    JSON.stringify({ partner_name: 'Aurora Research', scope: 'Docs e portal público' }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(p, { 'proposal 200': (r) => r.status === 200 });

  sleep(1);
}
