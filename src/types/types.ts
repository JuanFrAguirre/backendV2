export type Product = {
  id: string;
  title: string;
  image?: string;
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  presentationSize: number;
  tags?: string;
};
