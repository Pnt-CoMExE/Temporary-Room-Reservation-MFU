import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 50 },  // Ramp up to 50 users
    { duration: "1m", target: 300 },  // Peak load: 300 concurrent users
    { duration: "30s", target: 300 }, // Sustain peak load
    { duration: "30s", target: 0 },   // Ramp down to 0
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"], // 95% of requests must complete within 500ms
    http_req_failed: ["rate<0.01"],   // Less than 1% request failures
  },
};

const BASE_URL = __ENV.TARGET_URL || "http://localhost:3000";

export default function () {
  // 1. Health check & Provider status
  const resProviders = http.get(`${BASE_URL}/api/payment/providers`);
  check(resProviders, {
    "providers status is 200": (r) => r.status === 200,
  });

  // 2. Room list lookup under concurrency
  const resRooms = http.get(`${BASE_URL}/api/rooms`);
  check(resRooms, {
    "rooms status is 200": (r) => r.status === 200,
  });

  sleep(1);
}
