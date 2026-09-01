import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  scenarios: {
    browse: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "30s", target: 50 },
        { duration: "1m", target: 300 },
        { duration: "30s", target: 300 },
        { duration: "30s", target: 0 },
      ],
      exec: "browseRooms",
    },
    concurrent_booking: {
      executor: "shared-iterations",
      vus: 20,
      iterations: 20,
      maxDuration: "2m",
      exec: "concurrentBookingAttempt",
      startTime: "10s",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000"],
    http_req_failed: ["rate<0.05"],
  },
};

const BASE_URL = __ENV.TARGET_URL || "http://localhost:3000";
const USER_TOKEN = __ENV.K6_USER_TOKEN || "";

export function browseRooms() {
  const resProviders = http.get(`${BASE_URL}/api/payment/providers`);
  check(resProviders, { "providers 200": (r) => r.status === 200 });

  const resRooms = http.get(`${BASE_URL}/api/rooms`);
  check(resRooms, { "rooms 200": (r) => r.status === 200 });

  sleep(1);
}

export function concurrentBookingAttempt() {
  if (!USER_TOKEN) {
    console.warn("K6_USER_TOKEN not set — skipping booking write test");
    return;
  }

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  const bookingDate = futureDate.toISOString().slice(0, 10);

  const payload = {
    userId: 1,
    roomId: 1,
    userType: "internal",
    bookingDate,
    timeSlot: "full",
    objective: "k6 load test concurrent booking",
    roomPrice: 1000,
    addonsPrice: 0,
    totalPrice: 1000,
    addons: "[]",
  };

  const res = http.post(`${BASE_URL}/api/bookings`, payload, {
    headers: {
      Authorization: `Bearer ${USER_TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  check(res, {
    "booking accepted or conflict": (r) => r.status === 201 || r.status === 400,
  });
}
