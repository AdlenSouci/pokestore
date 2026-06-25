export type AppPage = 'home' | 'shop' | 'collection' | 'contact';

const PAGE_PATHS: Record<AppPage, string> = {
  home: '/',
  shop: '/shop',
  collection: '/collection',
  contact: '/contact',
};

export function pageToPath(page: AppPage): string {
  return PAGE_PATHS[page];
}

export function pathToPage(pathname: string): AppPage {
  const path = pathname.split('?')[0];
  if (path.startsWith('/shop')) return 'shop';
  if (path.startsWith('/collection')) return 'collection';
  if (path.startsWith('/contact')) return 'contact';
  return 'home';
}

export function navigateToPage(page: AppPage): void {
  const path = pageToPath(page);
  window.history.pushState({ page }, '', path);
}
