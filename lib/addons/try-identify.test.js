import OptableSDK from "../sdk";
import "./try-identify";

describe("tryIdentifyFromParams", () => {
  var SDK = null;

  beforeEach(() => {
    delete window.location;
    SDK = new OptableSDK({ host: "localhost", site: "test" });
    SDK.identify = jest.fn();
  });

  function setURL(url) {
    window.location = {
      search: url,
    };
  }

  test("is correct", () => {
    setURL(
      "http://some.domain.com/some/path?some=query&something=else&oeid=a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3&foo=bar&baz"
    );
    SDK.tryIdentifyFromParams();

    const expected = "e:a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
    expect(SDK.identify.mock.calls.length).toBe(1);
    expect(SDK.identify.mock.calls[0][0]).toEqual(expected);
  });

  test("identify not called when oeid absent", () => {
    setURL("http://some.domain.com/some/path?some=query&something=else");
    SDK.tryIdentifyFromParams();

    expect(SDK.identify.mock.calls.length).toBe(0);
  });

  test("identify not called when oeid not a SHA256 value", () => {
    setURL(
      "http://some.domain.com/some/path?some=query&something=else&oeid=AAAAAAAa665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3&foo=bar&baz"
    );
    SDK.tryIdentifyFromParams();

    expect(SDK.identify.mock.calls.length).toBe(0);
  });

  test("detects oeid regardless of case", () => {
    setURL(
      "http://some.domain.com/some/path?some=query&something=else&oEId=A665A45920422F9D417E4867EFDC4FB8A04A1F3FFF1FA07E998E86f7f7A27AE3&foo=bar&baz"
    );
    SDK.tryIdentifyFromParams();

    const expected = "e:a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
    expect(SDK.identify.mock.calls.length).toBe(1);
    expect(SDK.identify.mock.calls[0][0]).toEqual(expected);
  });
});
