/**
 * Videos by other people about layerling. Plain links, no embeds: an embedded
 * player would contact YouTube as soon as the page opens, and layerling keeps
 * visitors' data to itself. Newest first; `lang` is the spoken language.
 * The guide has a chapter with the same list in every language: 16-*.md in docs/guide/<language>. Change both
 * together: tests/unit/videoList.test.ts fails when a language lacks a video or lists them in another order.
 */
export const LAYERLING_VIDEOS = [
  {
    title: "I'm 100% In on Layerling - The Next Big Free CAD",
    channel: "Printology",
    lang: "EN",
    url: "https://youtu.be/IO7S-7bxS5o",
  },
  {
    // A whole playlist, so new videos in it arrive here without a release.
    title: "Layerling",
    channel: "TECHNOBENTO",
    lang: "EN",
    url: "https://www.youtube.com/playlist?list=PLYqVFeqYBrPE",
  },
  {
    // A whole playlist, so new videos in it arrive here without a release.
    title: "Layerling Tutorials",
    channel: "HL ModTech",
    lang: "EN",
    url: "https://www.youtube.com/playlist?list=PLZ-ZWS0D1JIk",
  },
  {
    // A whole playlist, so new videos in it arrive here without a release.
    title: "Layerling – Playlist",
    channel: "Making Layers",
    lang: "EN",
    url: "https://www.youtube.com/playlist?list=PLCsBmX2kOGWs",
  },
] as const;
