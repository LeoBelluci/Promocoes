export const stores = [
  {
    id: "battogo",
    name: "BATTOGO",
    marketplace: "Mercado Livre",
    logo: "/logos/battogo-black.svg",
    darkLogo: "/logos/battogo-white.svg",
    marketplaceLogo: "/logos/mercado-livre-login.jpg",
    route: "/stores/battogo"
  },
  {
    id: "bononi-acessorios",
    name: "BONONI ACESSORIOS",
    marketplace: "Mercado Livre",
    logo: "/logos/bononi-black.svg",
    darkLogo: "/logos/bononi-white.svg",
    marketplaceLogo: "/logos/mercado-livre-login.jpg",
    route: "/stores/bononi-acessorios"
  }
] as const;

export type Store = (typeof stores)[number];
export type StoreId = Store["id"];

export function getStoreById(storeId: string | null | undefined) {
  return stores.find((store) => store.id === storeId);
}

export function getStoreName(storeId: string | null | undefined) {
  return getStoreById(storeId)?.name ?? storeId ?? "Loja nao informada";
}

export function isValidStoreId(storeId: string) {
  return stores.some((store) => store.id === storeId);
}
