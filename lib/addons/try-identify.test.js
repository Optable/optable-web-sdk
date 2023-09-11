import OptableSDK from "../sdk";
import "./try-identify";

describe("tryIdentifyFromParams", () => {
  var SDK = null;

  beforeEach(() => {
    delete window.location;
    SDK = new OptableSDK({ host: "localhost", site: "test" }, false);
    SDK.identify = jest.fn();
  });

  function setURL(url) {
    window.location = {
      search: url,
    };
  }

  test("calls identify with default oeid param when present and matches expected pattern", () => {
    setURL(
      "http://some.domain.com/some/path?some=query&something=else&oeid=a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3&foo=bar&baz"
    );
    SDK.tryIdentifyFromParams();

    const expected = "e:a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
    expect(SDK.identify.mock.calls.length).toBe(1);
    expect(SDK.identify.mock.calls[0][0]).toEqual(expected);
  });

  test("doesnt call identify when default oeid param is absent", () => {
    setURL("http://some.domain.com/some/path?some=query&something=else");
    SDK.tryIdentifyFromParams();

    expect(SDK.identify.mock.calls.length).toBe(0);
  });

  test("doesnt call identify when oeid not a SHA256 value", () => {
    setURL(
      "http://some.domain.com/some/path?some=query&something=else&oeid=AAAAAAAa665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3&foo=bar&baz"
    );
    SDK.tryIdentifyFromParams();

    expect(SDK.identify.mock.calls.length).toBe(0);
  });

  test("matches oeid param regardless of its case", () => {
    setURL(
      "http://some.domain.com/some/path?some=query&something=else&oEId=A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86f7f7A27AE3&foo=bar&baz"
    );
    SDK.tryIdentifyFromParams();

    const expected = "e:a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
    expect(SDK.identify.mock.calls.length).toBe(1);
    expect(SDK.identify.mock.calls[0][0]).toEqual(expected);
  });

  test("matches custom param regardless of its case", () => {
    setURL(
      "http://some.domain.com/some/path?some=query&something=else&usEr_SHA=A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86f7f7A27AE3&foo=bar&baz"
    );
    SDK.tryIdentifyFromParams("user_sha");

    const expected = "e:a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
    expect(SDK.identify.mock.calls.length).toBe(1);
    expect(SDK.identify.mock.calls[0][0]).toEqual(expected);
  });

  test("doesnt call identify when custom param is absent", () => {
    setURL("http://some.domain.com/some/path?some=query&something=else");
    SDK.tryIdentifyFromParams("user_sha");

    expect(SDK.identify.mock.calls.length).toBe(0);
  });

  test("doesnt call identify when custom param not a SHA256 value", () => {
    setURL(
      "http://some.domain.com/some/path?some=query&something=else&user_sha=AAAAAAAa665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3&foo=bar&baz"
    );
    SDK.tryIdentifyFromParams("user_sha");

    expect(SDK.identify.mock.calls.length).toBe(0);
  });
});
