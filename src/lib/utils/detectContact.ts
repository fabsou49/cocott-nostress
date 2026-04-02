/**
 * Détecte la présence de coordonnées personnelles dans un texte :
 * adresses email, numéros de téléphone, URLs, handles réseaux sociaux.
 *
 * Utilisé pour bloquer les tentatives de bypass off-plateforme.
 */

const patterns: { label: string; regex: RegExp }[] = [
  {
    label: "adresse email",
    regex: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/,
  },
  {
    label: "numéro de téléphone",
    // Formats FR : 06 12 34 56 78 / +33612345678 / 0033612345678 / (33)612345678
    regex: /(?:\+33|0033|\(33\)|0)[1-9](?:[\s.\-]?\d{2}){4}/,
  },
  {
    label: "URL ou site web",
    // http(s)://, www., ou domaine en .com/.fr/.io/etc.
    regex: /(?:https?:\/\/|www\.)[^\s]{2,}|[a-zA-Z0-9\-]+\.(?:com|fr|io|net|org|co|me|dev|app|biz)[^\s]*/i,
  },
  {
    label: "handle réseau social",
    // @pseudo (min 3 chars), pas en début de mot pour éviter les faux positifs
    regex: /(?<![a-zA-Z])@[a-zA-Z0-9_.]{3,}/,
  },
  {
    label: "WhatsApp / Telegram mentionné avec un numéro",
    regex: /(?:whatsapp|telegram|signal|wechat|viber)[\s:]*(?:\+?\d[\d\s.\-]{7,})/i,
  },
];

export function detectContactInfo(text: string): { found: boolean; label?: string } {
  for (const { label, regex } of patterns) {
    if (regex.test(text)) {
      return { found: true, label };
    }
  }
  return { found: false };
}
