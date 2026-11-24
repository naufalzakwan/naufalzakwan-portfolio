type PlaylistDisc = Readonly<{
  id: string; name: string; src: string | null; alt: string; objectPosition: string;
  diameter: number; rise: number; tilt: number;
  pattern: "orbit" | "fold" | "halo" | "ripple";
  ink: string; glow: string; paper: string;
}>;

export const playlistArchive = {
  heading: "Di Balik Playlist Saya",
  description: "Album musik inilah yang menemani saya hampir setiap hari ",
  // Owner-supplied artwork follows the existing CD order.
  discs: [
    { id: "disc-01", name: "CD 01", src: "/images/music/cd1.jpg", alt: "Artwork playlist untuk CD 01", objectPosition: "center", diameter: 280, rise: 14, tilt: -7, pattern: "orbit", ink: "#29170f", glow: "#a96032", paper: "#e8bd85" },
    { id: "disc-02", name: "CD 02", src: "/images/music/cd2.jpg", alt: "Artwork playlist untuk CD 02", objectPosition: "center", diameter: 360, rise: 0, tilt: 5, pattern: "fold", ink: "#0e1c23", glow: "#3c6871", paper: "#d7d5b8" },
    { id: "disc-03", name: "CD 03", src: "/images/music/cd3.jpg", alt: "Artwork playlist untuk CD 03", objectPosition: "center", diameter: 460, rise: 34, tilt: -5, pattern: "halo", ink: "#211a10", glow: "#b88b3f", paper: "#f0d6a0" },
    { id: "disc-04", name: "CD 04", src: "/images/music/cd4.jpg", alt: "Artwork playlist untuk CD 04", objectPosition: "center", diameter: 320, rise: 8, tilt: 7, pattern: "ripple", ink: "#24141b", glow: "#985767", paper: "#edc8b0" },
    { id: "disc-05", name: "CD 05", src: "/images/music/cd5.jpg", alt: "Artwork playlist untuk CD 05", objectPosition: "center", diameter: 480, rise: 20, tilt: -4, pattern: "fold", ink: "#392b20", glow: "#c7ad83", paper: "#f1e3c7" },
    { id: "disc-06", name: "CD 06", src: "/images/music/cd6.jpg", alt: "Artwork playlist untuk CD 06", objectPosition: "center", diameter: 300, rise: 4, tilt: 6, pattern: "halo", ink: "#21170f", glow: "#9f7146", paper: "#e6c7a1" },
    { id: "disc-07", name: "CD 07", src: "/images/music/cd7.jpg", alt: "Artwork playlist untuk CD 07", objectPosition: "center", diameter: 420, rise: 42, tilt: -6, pattern: "ripple", ink: "#291816", glow: "#aa5b3c", paper: "#efc08d" },
    { id: "disc-08", name: "CD 08", src: "/images/music/cd9.jpg", alt: "Artwork playlist untuk CD 08", objectPosition: "center", diameter: 340, rise: 10, tilt: 4, pattern: "orbit", ink: "#192025", glow: "#707985", paper: "#e6dfce" },
  ] as const satisfies readonly PlaylistDisc[],
} as const;
