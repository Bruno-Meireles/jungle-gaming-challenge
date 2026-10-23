import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage } from '@jg/design-system';
import { Link } from '@tanstack/react-router';

export type PageBreadcrumbItem = { label: string; to?: '/' | '/cart' };

/** Trilha de navegacao (desktop e tablet); no mobile o Figma usa o botao Voltar. */
export function PageBreadcrumb({ label, items }: { label: string; items: PageBreadcrumbItem[] }) {
  return (
    <Breadcrumb label={label} className="mb-24 hidden tablet:block">
      {items.map((item) => (
        <BreadcrumbItem key={item.label}>
          {item.to ? (
            <BreadcrumbLink asChild>
              <Link to={item.to}>{item.label}</Link>
            </BreadcrumbLink>
          ) : (
            <BreadcrumbPage>{item.label}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
}
