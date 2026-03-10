export async function fetchWhisper({ word1, word2, cz1, cz2, kontext, deniKontext }) {
  const apiKey = localStorage.getItem("solorpg_api_key");
  if (!apiKey) return null;

  const userParts = [`${word1} + ${word2}`];
  if (cz1 && cz2) userParts[0] += ` (${cz1} + ${cz2})`;
  if (kontext) userParts[0] += `\nKontext: ${kontext}`;
  if (deniKontext) userParts.push(`\nKontext příběhu:\n${deniKontext}`);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "anthropic-dangerous-direct-browser-access": "true",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5",
        max_tokens: 80,
        temperature: 0.9,
        system: `Našeptávač pro sólové RPG. Svět Mausritter — inteligentní myši.

Hráč hodil dvě slova. Vrať přesně 3 řádky.

FORMÁT:
- 3 až 7 slov na řádek
- Krátký fragment — ne celá věta, ne příběh
- Jeden smyslový obraz: barva, textura, zvuk, vůně, teplota
- Bez odrážek, bez úvodů, bez vysvětlení
- Výhradně česky

Pokud hráč napsal kontext (otázku), zaměř inspirace na ten kontext.

MĚŘÍTKO: Jsi myš. Žalud=balvan. Stéblo=strom. Kočka=drak. Lidský dům=hrad.

PŘEKVAP: Neobvyklé detaily. Synestézie. Žádné první asociace — jdi hlouběji.

Vrať JEN 3 řádky. Nic víc.`,
        messages: [{ role: "user", content: userParts.join("") }],
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const text = data?.content?.[0]?.text;
    if (!text) return null;

    return text.split("\n").filter((line) => line.trim());
  } catch {
    return null;
  }
}
