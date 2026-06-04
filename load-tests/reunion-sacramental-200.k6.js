import http from "k6/http";
import { check, sleep } from "k6";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";

export const options = {
  stages: [
    { duration: "1m", target: 50 },
    { duration: "1m", target: 100 },
    { duration: "1m", target: 200 },
    { duration: "1m", target: 200 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<2000"],
  },
};

export default function () {
  const response = http.get(`${BASE_URL}/reunion-sacramental`);

  check(response, {
    "GET /reunion-sacramental responde 200": (res) => res.status === 200,
    "GET /reunion-sacramental responde en menos de 2s": (res) =>
      res.timings.duration < 2000,
  });

  sleep(1);
}
