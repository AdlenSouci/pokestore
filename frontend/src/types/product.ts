export interface Product {
  id: string;          // On le garde en string pour le frontend
  name: string;
  description: string; // On va la générer car elle n'est pas en base
  price: number;
  image: string;       // Sera mappé depuis 'imageUrl'
  // On passe en string générique car ta DB renvoie 'Fire', 'Water' (anglais)
  // au lieu de 'Feu', 'Eau' (français).
  category: string;    
  rarity: string;
}