import { useEffect } from 'react';

export function useDocumentMeta({
  title,
  description,
}: {
  title: string;
  description: string;
}): void {
  useEffect(() => {
    document.title = title;
    let meta = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = 'description';
      document.head.append(meta);
    }
    meta.content = description;
  }, [title, description]);
}
