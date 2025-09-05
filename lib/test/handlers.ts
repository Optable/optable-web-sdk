import { http, HttpResponse } from "msw";
import { TEST_BASE_URL } from "./mocks";
import { Uid2TokenResponse } from "edge/uid2_token";
import { SiteResponse } from "edge/site";
import { TokenizeResponse } from "edge/tokenize";
import { TargetingResponse } from "edge/targeting";
import { EdgePassport } from "edge/passport";
import { ResolveResponse } from "edge/resolve";

const ok200 = {
  status: 200,
};

const passport: EdgePassport = {
  passport: "PASSPORT",
};

const handlers = [
  http.get(`${TEST_BASE_URL}/config`, async ({}) => {
    const data: SiteResponse = {};
    return HttpResponse.json({ ...data, ...passport }, ok200);
  }),

  http.post(`${TEST_BASE_URL}/identify`, async ({}) => {
    return HttpResponse.json({ ...passport }, ok200);
  }),

  http.post(`${TEST_BASE_URL}/uid2/token`, async ({}) => {
    const data: Uid2TokenResponse = {
      advertising_token: "gfsdgsdfgsdeagdfs",
      RefreshToken: "dasdasdasdas",
      IdentityExpires: 1734459312780,
      RefreshFrom: 1734462312780,
      RefreshExpires: 2734462312780,
      RefreshResponseKey: "gdsfgfsd",
    };
    return HttpResponse.json({ ...data, ...passport }, ok200);
  }),

  http.post(`${TEST_BASE_URL}/witness`, async ({}) => {
    return HttpResponse.json({ ...passport }, ok200);
  }),

  http.post(`${TEST_BASE_URL}/profile`, async ({}) => {
    return HttpResponse.json({ ...passport }, ok200);
  }),

  http.get(`${TEST_BASE_URL}/v1/resolve`, async ({}) => {
    const data: ResolveResponse = {
      clusters: [],
    };
    return HttpResponse.json({ ...data, ...passport }, ok200);
  }),

  http.post(`${TEST_BASE_URL}/v2/tokenize`, async ({}) => {
    const data: TokenizeResponse = {
      User: {
        data: [],
        ext: undefined,
      },
    };
    return HttpResponse.json({ ...data, ...passport }, ok200);
  }),

  http.get(`${TEST_BASE_URL}/v2/targeting`, async ({}) => {
    const data: TargetingResponse = {
      audience: [],
      user: [],
    };
    return HttpResponse.json({ ...data, ...passport }, ok200);
  }),

  http.get(`${TEST_BASE_URL}/v1/resolve`, async ({}) => {
    const data: ResolveResponse = {
      clusters: [],
    };
    return HttpResponse.json({ ...data, ...passport }, ok200);
  }),
];

export { handlers };
