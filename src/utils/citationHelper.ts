import { Publication } from '../types';

export function formatAuthorsAPA(publication: Publication): string {
  const sorted = [...publication.authors].sort((a, b) => a.order - b.order);
  if (sorted.length === 0) return 'Kurdhi, N. A.';

  const formatted = sorted.map(a => {
    const parts = a.name.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const lastName = parts[parts.length - 1];
    const initials = parts.slice(0, parts.length - 1).map(p => p[0] + '.').join(' ');
    return `${lastName}, ${initials}`;
  });

  if (formatted.length === 1) return formatted[0];
  if (formatted.length === 2) return `${formatted[0]}, & ${formatted[1]}`;
  return `${formatted.slice(0, -1).join(', ')}, & ${formatted[formatted.length - 1]}`;
}

export function generateAPACitation(pub: Publication): string {
  const authors = formatAuthorsAPA(pub);
  const year = pub.year;
  const title = pub.title;
  const venue = pub.venue;
  const vol = pub.volume ? ` ${pub.volume}` : '';
  const issue = pub.issue ? `(${pub.issue})` : '';
  const pages = pub.pages ? `, ${pub.pages}` : '';
  const doi = pub.doi ? ` https://doi.org/${pub.doi.replace(/^https?:\/\/doi\.org\//, '')}` : '';

  return `${authors} (${year}). ${title}. ${venue},${vol}${issue}${pages}.${doi}`;
}

export function generateIEEECitation(pub: Publication): string {
  const sorted = [...pub.authors].sort((a, b) => a.order - b.order);
  const authorsStr = sorted.map(a => {
    const parts = a.name.trim().split(' ');
    if (parts.length === 1) return parts[0];
    const lastName = parts[parts.length - 1];
    const initials = parts.slice(0, parts.length - 1).map(p => p[0] + '.').join(' ');
    return `${initials} ${lastName}`;
  }).join(', ');

  const vol = pub.volume ? `, vol. ${pub.volume}` : '';
  const issue = pub.issue ? `, no. ${pub.issue}` : '';
  const pages = pub.pages ? `, pp. ${pub.pages}` : '';
  const doi = pub.doi ? `, doi: ${pub.doi}` : '';

  return `${authorsStr}, "${pub.title}," ${pub.venue}${vol}${issue}${pages}, ${pub.year}${doi}.`;
}

export function generateBibTeX(pub: Publication): string {
  const firstAuthorLastName = pub.authors[0]?.name.split(' ').pop()?.toLowerCase() || 'kurdhi';
  const citeKey = `${firstAuthorLastName}${pub.year}${pub.title.slice(0, 10).replace(/\W/g, '').toLowerCase()}`;
  const authorsBib = pub.authors.map(a => a.name).join(' and ');
  const entryType = pub.type === 'Conference Paper' ? 'inproceedings' : 'article';

  return `@${entryType}{${citeKey},
  title = {${pub.title}},
  author = {${authorsBib}},
  ${entryType === 'inproceedings' ? 'booktitle' : 'journal'} = {${pub.venue}},
  year = {${pub.year}},
  ${pub.volume ? `volume = {${pub.volume}},` : ''}
  ${pub.issue ? `number = {${pub.issue}},` : ''}
  ${pub.pages ? `pages = {${pub.pages}},` : ''}
  ${pub.doi ? `doi = {${pub.doi}},` : ''}
  ${pub.url ? `url = {${pub.url}}` : ''}
}`;
}
