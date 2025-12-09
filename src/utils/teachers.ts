export interface Teacher {
  name: string
  email: string
}

/**
 * After inspection on the timetable, it looks like
 * the intials are constants and if already taken,
 * a variant is used (e.g.: BX because BC was maybe previously taken)
 *
 * @see https://www.unilim.fr/annuaire/
 */
export const initials = {
  "BX": {
    name: "Claire BOMBEAUX",
    email: "claire.bombeaux.aff@unilim.fr"
  },
  "AB": {
    name: "Anne BERJON",
    email: "anne.berjon@unilim.fr"
  },
  "TH": {
    name: "Thomas HÜGEL",
    email: "thomas.hugel@unilim.fr"
  },
  "JP": {
    name: "Jonathan PARIS",
    email: "jonathan.paris@unilim.fr"
  },
  "AP": {
    name: "Anaïs POURSAT",
    email: "anais.poursat@unilim.fr"
  },
  "MP": {
    name: "Maxime PICHON",
    email: "maxime.pichon.aff@unilim.fr"
  },
  "JF": {
    name: "Julien FREDON",
    email: "julien.fredon.aff@unilim.fr"
  },
  "DM": {
    name: "David MINGO",
    email: "david.mingo.aff@unilim.fr"
  },
  "SM": {
    name: "Stéphane MÉRILLOU",
    email: "stephane.merillou@unilim.fr"
  },
  "NM": {
    name: "Nicolas MÉRILLOU",
    email: "nicolas.merillou@unilim.fr",
  },
  "LD": {
    name: "Laurent DUBREUIL",
    email: "laurent.dubreuil@unilim.fr"
  },
  "JL": {
    name: "Julie LAIRESSE",
    email: "julie.lairesse@unilim.fr"
  },
  "PK": {
    name: "Philippe KREJČÍ",
    email: "kphil@protonmail.com"
  },
  "JPN": {
    name: "Jessy PROQUIN",
    email: "jessy.proquin@legrand.com"
  },
  "AT": {
    name: "Albert THERON",
    email: "albert.theron.aff@unilim.fr"
  },
  "IB": {
    name: "Isabelle BLASQUEZ",
    email: "isabelle.blasquez@unilim.fr"
  },
  "VB": {
    name: "Véronique BAULANT",
    email: "veronique.baulant@ac-limoges.fr"
  },
  "JDE": {
    name: "Jérome DEPAIFVE",
    email: "jerome.depaifve@gmail.com"
  },
  "TM": {
    name: "Thierry MONEDIERE",
    email: "thierry.monediere@unilim.fr"
  },
  "CP": {
    name: "Christian PUPILLE",
    email: "christian.pupille.aff@unilim.fr"
  },
  "CO": {
    name: "Cristina ONETE",
    email: "maria-cristina.onete@unilim.fr"
  },
  "TB": {
    name: "Thierry BERTHIER",
    email: "thierry.berthier@unilim.fr"
  },
  "GS": {
    name: "Grégory SIMONNE",
    email: "gregory.simonne@unilim.fr"
  }
} as Record<string, Teacher>

/**
 * @param short
 * @returns teacher if found
 */
export const shortToFullTeacherName = (short: string): Teacher | undefined => {
  if (short.includes(" ")) {
    const [lastName, firstNameChar] = short.toLowerCase().split(" ");

    return Object.values(initials).find(({ name }) => {
      const [currFirstName, currLastName] = name.toLowerCase().split(" ");
      return currLastName === lastName && currFirstName[0] === firstNameChar[0]
    });
  }

  return initials[short];
}
