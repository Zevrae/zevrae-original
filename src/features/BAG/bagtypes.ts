export interface BagItem {
  id: string;
  name: string;
  image: string;
  price: number;
  comparePrice?: number;
  size: string;
  quantity: number;
}

export interface BagState {
  items: BagItem[];
}