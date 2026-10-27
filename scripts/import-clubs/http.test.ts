// @vitest-environment node
import { readFile, writeFile } from "node:fs/promises";
import { chunk, getJson } from "./http";

vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(async () => undefined),
  mkdir: vi.fn(async () => undefined),
}));

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.useFakeTimers();
  vi.stubGlobal("fetch", fetchMock);
  vi.mocked(readFile).mockRejectedValue(new Error("absent du cache"));
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  fetchMock.mockReset();
});

/** Lance la requête en laissant s'écouler les pauses simulées. */
async function run<T>(promise: Promise<T>): Promise<T> {
  const settled = promise.then(
    (value) => ({ value }),
    (error: unknown) => ({ error }),
  );
  await vi.runAllTimersAsync();
  const result = await settled;
  if ("error" in result) throw result.error;
  return result.value;
}

describe("requête JSON avec cache", () => {
  it("lit le cache sans interroger le serveur", async () => {
    vi.mocked(readFile).mockResolvedValueOnce('{"club":"Pau"}');
    expect(await run(getJson("https://wiki.test/a"))).toEqual({ club: "Pau" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("interroge le serveur, s'identifie et garde la réponse", async () => {
    fetchMock.mockResolvedValueOnce(new Response('{"ok":true}'));
    expect(await run(getJson("https://wiki.test/a", "text/x"))).toEqual({
      ok: true,
    });
    const headers = fetchMock.mock.calls[0][1]?.headers as Record<
      string,
      string
    >;
    expect(headers["Accept"]).toBe("text/x");
    expect(headers["User-Agent"]).toContain("rugby-tcg");
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringMatching(/\.cache\/import-clubs\/[0-9a-f]{40}\.json$/),
      '{"ok":true}',
    );
  });

  it("ralentit quand le serveur le demande, puis réessaie", async () => {
    fetchMock
      .mockResolvedValueOnce(
        new Response(null, { status: 429, headers: { "Retry-After": "2" } }),
      )
      .mockResolvedValueOnce(new Response(null, { status: 429 }))
      .mockResolvedValueOnce(new Response("[1]"));
    expect(await run(getJson("https://wiki.test/a"))).toEqual([1]);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("abandonne sur une autre erreur, ou après trop d'essais", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(null, { status: 500, statusText: "Erreur" }),
    );
    await expect(run(getJson("https://wiki.test/a"))).rejects.toThrow(
      "500 Erreur pour https://wiki.test/a",
    );

    fetchMock.mockImplementation(
      async () => new Response(null, { status: 429 }),
    );
    await expect(run(getJson("https://wiki.test/b"))).rejects.toThrow("429");
    expect(fetchMock).toHaveBeenCalledTimes(1 + 5);
  });
});

describe("découpage en lots", () => {
  it("garde l'ordre et laisse un dernier lot incomplet", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk([], 3)).toEqual([]);
  });
});
