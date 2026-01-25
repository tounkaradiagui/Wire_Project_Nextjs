export const MALE_NAMES = [
    "Moussa", "Ibrahim", "Oumar", "Amadou", "Mamadou",
    "Boubacar", "Seydou", "Youssouf", "Abdoulaye", "Modibo", "Diagui",
    "Sambou", "Boubou"
];

export const FEMALE_NAMES = [
    "Aïcha", "Fatoumata", "Aminata", "Mariam", "Kadidia",
    "Hawa", "Ramata", "Fanta", "Nafissatou", "Sira"
];

export const LAST_NAMES = [
    "Traoré", "Diallo", "Coulibaly", "Keïta", "Konaté",
    "Camara", "Diarra", "Sanogo", "Sidibé", "Touré",
    "Tounkara", "Djenepo", "Sacko", "Diallo"
];

export function randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function randomName(sex: "MALE" | "FEMALE") {
    return {
        name: sex === "MALE" ? randomElement(MALE_NAMES) : randomElement(FEMALE_NAMES),
        surname: randomElement(LAST_NAMES),
    };
}
