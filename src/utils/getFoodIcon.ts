import { foodIcons } from './foodIcons';

export function getFoodIcon(name: string): string {
  if (!name) {
    return '🍴'; // Si le nom est vide ou invalide, retourne un emoji par défaut
  }

  // Convertir le nom en minuscules pour la recherche
  const nameLowerCase = name.toLowerCase();

  // Cherche dans les icônes d'aliments
  for (const [food, emoji] of Object.entries(foodIcons)) {
    if (food.toLowerCase().includes(nameLowerCase)) {
      return emoji as string;
    }
  }

  // Retourne un emoji par défaut si aucune correspondance n'est trouvée
  return '🍴'; // Emoji par défaut
}
