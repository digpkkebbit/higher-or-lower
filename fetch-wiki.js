const WIKI_GE_DUMP = "https://prices.runescape.wiki/api/v1/osrs/1h";
const WIKI_GE_MAPPING = "https://chisel.weirdgloop.org/gazproj/gazbot/os_dump.json";

export const fetchGEDump = async () => fetchWiki(WIKI_GE_DUMP);
export const fetchGEMapping = async () => fetchWiki(WIKI_GE_MAPPING);

const fetchWiki = async (url) => {
    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": `higher-or-lower/${process.env.ENVIRONMENT} (${process.env.CONTACT_EMAIL})`
            }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const text = await res.text();

        if (!text) throw new Error("Empty response body");

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("JSON parse failed:", text.slice(0, 200) + "... " + e);
            throw new Error("Invalid JSON received");
        }

        return data;

    } catch (e) {
        console.error("Error fetching dump:", e);
    }
}