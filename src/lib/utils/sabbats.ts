export interface Sabbat {
  name: string;
  month: number;
  day: number;
  rotation: number;
  description: string;
  date?: Date;
  colors: string[];
}

export const sabbats: Sabbat[] = [
  {
    name: "Imbolc",
    month: 2,
    day: 1,
    rotation: -45,
    colors: ["#FFFFFF", "#90EE90", "#E34234", "#FFD700"], // White, Light Green, Vermilion, Gold
    description:
      "Imbolc marks the first stirrings of spring, a time of purification and honouring the return of light. It is a period for setting intentions for the coming year and preparing for the awakening of the earth.\n\nTraditionally celebrated with fire and cleansing rituals, this festival bridges the gap between deep winter and the sprouting of new life. It encourages us to look inward and cultivate the quiet energy needed to bring our goals to fruition.",
  },
  {
    name: "Ostara",
    month: 3,
    day: 21,
    rotation: 0,
    colors: ["#FFC0CB", "#B0E0E6", "#90EE90", "#FFFFE0"], // Pink, Pale Blue, Light Green, Light Yellow
    description:
      "Ostara, the Spring Equinox, celebrates the perfect balance of light and dark, as day and night are of equal length. This Sabbat signifies new beginnings, growth, and the fertility of the land as nature bursts forth with renewed vitality.\n\nIt is a time to plant seeds, both metaphorically and physically, and to find equilibrium in our own lives. As the world awakens, we are invited to embrace action, creativity, and the joy of a fresh start.",
  },
  {
    name: "Beltane",
    month: 5,
    day: 1,
    rotation: 45,
    colors: ["#FF0000", "#228B22", "#FFFFFF", "#FFFF00"], // Red, Forest Green, White, Yellow
    description:
      "Beltane honours the peak of spring and the union of the god and goddess, symbolising fertility, passion, and the full blooming of life. The fires of Beltane are traditionally lit to celebrate the warmth of the sun and the abundance of the coming summer.\n\nThis Sabbat is an invitation to celebrate your own passions, vitality, and creativity. It is a time for outward action, community, and stepping fully into the warmth and energy of the season.",
  },
  {
    name: "Litha",
    month: 6,
    day: 21,
    rotation: 90,
    colors: ["#FFD700", "#FF8C00", "#FF4500", "#87CEEB"], // Gold, Dark Orange, Orange Red, Sky Blue
    description:
      "Litha, the Summer Solstice, represents the longest day of the year and the height of the sun's power. It is a celebration of light, community, and the abundance that comes from the peak of growth and warmth.\n\nWhile we honour this pinnacle of external energy, it is also a reminder that the cycle will inevitably turn toward darkness. It is a time to be present, to give gratitude for the fruits of our efforts, and to enjoy the radiance of the season.",
  },
  {
    name: "Lughnasadh",
    month: 8,
    day: 1,
    rotation: 135,
    colors: ["#DAA520", "#CD7F32", "#8B4513", "#556B2F"], // Goldenrod, Bronze, Saddle Brown, Dark Olive Green
    description:
      "Lughnasadh, the first harvest, marks the start of the transition from summer to autumn. It is a celebration of the ripening grain and the initial reaping of the rewards from the efforts planted earlier in the year.\n\nThis Sabbat invites us to acknowledge the necessity of reaping what we have sown and to express gratitude for our abundance. It is a time for reflection on what we have nurtured and what we are now ready to harvest.",
  },
  {
    name: "Mabon",
    month: 9,
    day: 21,
    rotation: 180,
    colors: ["#B22222", "#D2691E", "#4B0082", "#006400"], // Firebrick, Chocolate, Indigo, Dark Green
    description:
      "Mabon, the Autumn Equinox, is the second harvest festival, balancing the light and dark once more as we prepare for the descent into winter. It is a time of deep gratitude, reflection, and preparation for the dormant season.\n\nAs the leaves fall and the light wanes, we are encouraged to release what no longer serves us. Mabon is a period of giving thanks for all that we have accomplished and finding peace in the natural cycle of letting go.",
  },
  {
    name: "Samhain",
    month: 10,
    day: 31,
    rotation: 225,
    colors: ["#000000", "#FF4500", "#8B0000", "#F5F5F5"], // Black, Orange Red, Dark Red, White Smoke
    description:
      "Samhain marks the end of the harvest and the start of the darker half of the year, often called the witches' new year. The veil between the physical and spiritual worlds is at its thinnest, making it a powerful time for honouring ancestors and reflecting on the cycle of life and death.\n\nIt is a Sabbat for introspection, deep listening, and releasing the old to make space for future growth during the quiet winter months. We honour the darkness not as an end, but as a necessary space for gestation and renewal.",
  },
  {
    name: "Yule",
    month: 12,
    day: 21,
    rotation: 270,
    colors: ["#B22222", "#006400", "#FFD700", "#C0C0C0"], // Firebrick, Dark Green, Gold, Silver
    description:
      "Yule, the Winter Solstice, is the longest night of the year, a moment of profound stillness and the turning point where the light begins its slow return. It is a time of hope, quiet celebration, and honouring the resilience of life in the midst of cold.\n\nEven in the depths of winter, the promise of spring remains. Yule encourages us to find warmth in community and reflection, nurturing our inner spark so it can grow stronger as the days begin to lengthen again.",
  },
];

export function getCurrentSabbat(now: Date = new Date()): Sabbat {
  const year = now.getFullYear();
  const getSabbatDate = (s: Sabbat, y: number) =>
    new Date(y, s.month - 1, s.day);
  const allSabbats = [
    ...sabbats.map((s) => ({ ...s, date: getSabbatDate(s, year - 1) })),
    ...sabbats.map((s) => ({ ...s, date: getSabbatDate(s, year) })),
    ...sabbats.map((s) => ({ ...s, date: getSabbatDate(s, year + 1) })),
  ].sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));

  for (let i = 0; i < allSabbats.length - 1; i++) {
    if (
      now >= (allSabbats[i].date || new Date()) &&
      now < (allSabbats[i + 1].date || new Date())
    ) {
      return allSabbats[i];
    }
  }
  return allSabbats[allSabbats.length - 1];
}
