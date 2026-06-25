import type { Product } from './product';

export type RootStackParamList = {
  Home: undefined;
  Shop: undefined;
  CardDetail: { product: Product };
  Login: undefined;
  Register: undefined;
  Cart: undefined;
  Orders: undefined;
  Collection: undefined;
  Contact: undefined;
};
