import type { Scheme, SchemeCriteria } from '@workspace/api-client-react';
import {
  Briefcase,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  House,
  LayoutGrid,
  Sprout,
  type LucideIcon,
} from 'lucide-react';

export const GUIDANCE_NOTE =
  'Suvidha helps you discover schemes. A result does not confirm eligibility. Scheme rules can change, so check the official source before applying.';

export const SUGGESTED_SEARCHES = ['Scholarship', 'Farmer support', 'Fee waiver', 'Solar pump'];

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  education: GraduationCap,
  agriculture: Sprout,
  'women and children': HeartHandshake,
  'women & children': HeartHandshake,
  health: HeartPulse,
  healthcare: HeartPulse,
  housing: House,
  'employment and skills': Briefcase,
  employment: Briefcase,
};

export function categoryIcon(category: string): LucideIcon {
  return CATEGORY_ICONS[category.toLowerCase()] ?? LayoutGrid;
}

export function formatVerified(value: string | null | undefined): string | null {
  if (!value) return null;
  const time = Date.parse(value);
  if (Number.isNaN(time)) return null;
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(time));
}

/** A short plain-language line describing what the scheme offers. */
export function schemeSummary(scheme: Scheme): string {
  return (
    scheme.benefits?.[0] ??
    scheme.intendedBeneficiaries?.[0] ??
    'Open the scheme details to read what it offers and who it is for.'
  );
}

export function schemeLocation(scheme: Scheme): string | null {
  const regions = (scheme.regions ?? []).filter(Boolean);
  return regions.length ? regions.join(', ') : null;
}

export function levelLabel(level: Scheme['governmentLevel']): string {
  return level === 'central' ? 'Central government' : 'State government';
}

const STOP_WORDS = new Set([
  'and',
  'the',
  'for',
  'with',
  'from',
  'in',
  'of',
  'to',
  'a',
  'an',
  'support',
  'scheme',
  'schemes',
  'yojana',
  'assam',
  'government',
  'gov',
]);

export function searchTokens(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 2 && !STOP_WORDS.has(token));
}

export function matchesSchemeQuery(scheme: Scheme, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const haystack = [
    scheme.name,
    scheme.category,
    ...(scheme.regions ?? []),
    ...(scheme.intendedBeneficiaries ?? []),
    ...(scheme.benefits ?? []),
    ...(scheme.requiredDocuments ?? []),
    ...(scheme.applicationSteps ?? []),
  ]
    .join(' ')
    .toLowerCase();

  if (haystack.includes(q)) return true;

  const tokens = searchTokens(q);
  if (tokens.length === 0) return haystack.includes(q);
  return tokens.every((token) => haystack.includes(token));
}

/** Simple relevance score used to sort search results on the client. */
export function relevanceScore(scheme: Scheme, query: string): number {
  const phrase = query.trim().toLowerCase();
  if (!phrase) return 0;
  const name = scheme.name.toLowerCase();
  const category = scheme.category.toLowerCase();
  const rest = [...scheme.intendedBeneficiaries, ...scheme.benefits, ...scheme.regions].join(' ').toLowerCase();
  let score = name.includes(phrase) ? 10 : 0;
  for (const token of searchTokens(phrase)) {
    if (name.includes(token)) score += 4;
    if (category.includes(token)) score += 3;
    if (rest.includes(token)) score += 1;
  }
  return score;
}

const READABLE: Record<string, string> = {
  rural: 'Village or rural area',
  urban: 'Town or city',
  student: 'Currently studying',
  not_student: 'Not currently studying',
  employed: 'Has a job',
  unemployed: 'Looking for work',
  self_employed: 'Works for themselves',
  farmer: 'Farmer',
  general: 'General',
  sc: 'Scheduled Caste (SC)',
  st: 'Scheduled Tribe (ST)',
  obc: 'Other Backward Classes (OBC)',
  ews: 'Economically Weaker Section (EWS)',
  woman: 'Women',
  man: 'Men',
  other: 'Other gender identities',
};

const readable = (value: string) => READABLE[value] ?? value;

/** Converts structured criteria into plain-language rows. */
export function criteriaRows(criteria: SchemeCriteria | undefined): [string, string][] {
  if (!criteria) return [];
  const rows: [string, string][] = [];
  const { minAge, maxAge } = criteria;
  if (minAge != null && maxAge != null) rows.push(['Age', `${minAge} to ${maxAge} years`]);
  else if (minAge != null) rows.push(['Age', `${minAge} years or older`]);
  else if (maxAge != null) rows.push(['Age', `Up to ${maxAge} years`]);
  if (criteria.states?.length) rows.push(['Where you live', criteria.states.join(', ')]);
  if (criteria.residences?.length) rows.push(['Area', criteria.residences.map(readable).join(' or ')]);
  if (criteria.studentStatuses?.length) rows.push(['Studies', criteria.studentStatuses.map(readable).join(' or ')]);
  if (criteria.employmentStatuses?.length) rows.push(['Work', criteria.employmentStatuses.map(readable).join(' or ')]);
  if (criteria.socialCategories?.length) rows.push(['Social category', criteria.socialCategories.map(readable).join(', ')]);
  if (criteria.gender?.length) rows.push(['Gender', criteria.gender.map(readable).join(', ')]);
  return rows;
}

export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export interface SchemeVisual {
  src: string;
  alt: string;
  caption: string;
}

/**
 * Maps each scheme to its own unique, matching Assam / Indian government scheme photograph.
 */
export function schemeImage(scheme: Scheme): SchemeVisual {
  const lower = `${scheme.name} ${scheme.category}`.toLowerCase();

  // --- Education Schemes (6 distinct photos) ---
  if (lower.includes('scooty') || lower.includes('pragyan') || lower.includes('banikanta')) {
    return {
      src: '/images/pragyan-scooty.jpg',
      alt: 'Assam college students with scooters under the Pragyan Bharati Merit Award scheme',
      caption: 'Pragyan Bharati Scooty Merit Award',
    };
  }
  if (lower.includes('anundoram') || lower.includes('borooah')) {
    return {
      src: '/images/student-award.jpg',
      alt: 'Government merit award and laptop presentation to an Indian student',
      caption: 'Anundoram Borooah Award Scheme',
    };
  }
  if (lower.includes('fee waiver') || lower.includes('free admission')) {
    return {
      src: '/images/assam-education.jpg',
      alt: 'Historic Cotton College campus in Guwahati, Assam representing free college admission',
      caption: 'Assam Free Admission (Fee Waiver)',
    };
  }
  if (lower.includes('abhinandan') || lower.includes('education loan')) {
    return {
      src: '/images/abhinandan-loan.jpg',
      alt: 'Student and parent reviewing higher education loan subsidy documents',
      caption: 'Abhinandan Education Loan Subsidy',
    };
  }
  if (lower.includes('ishan uday')) {
    return {
      src: '/images/ishan-uday.jpg',
      alt: 'Modern university campus in Northeast India under clear blue skies with students walking',
      caption: 'Ishan Uday NER Scholarship',
    };
  }
  if (lower.includes('post-matric') || lower.includes('post matric')) {
    return {
      src: '/images/post-matric.jpg',
      alt: 'Assam college students studying together with textbooks and laptops in a university library',
      caption: 'Assam Post-Matric Scholarship',
    };
  }

  // --- Agriculture Schemes (6 distinct photos) ---
  if (lower.includes('pm kisan') || lower.includes('samman nidhi')) {
    return {
      src: '/images/pm-kisan.jpg',
      alt: 'PM Kisan Samman Nidhi government farmer income support banner',
      caption: 'PM-KISAN Direct Benefit Transfer',
    };
  }
  if (lower.includes('solar') || lower.includes('kusum')) {
    return {
      src: '/images/solar-pump.jpg',
      alt: 'Solar photovoltaic water pumping panels for agricultural irrigation in India',
      caption: 'PM-KUSUM Solar Irrigation',
    };
  }
  if (lower.includes('afcss') || lower.includes('farmers credit subsidy')) {
    return {
      src: '/images/afcss-credit.jpg',
      alt: 'Assamese farmer standing beside green agricultural fields with modern farm equipment',
      caption: 'Assam Farmers Credit Subsidy (AFCSS)',
    };
  }
  if (lower.includes('kisan credit') || lower.includes('kcc')) {
    return {
      src: '/images/assam-tea.jpg',
      alt: 'Assam tea garden workers and small agricultural growers',
      caption: 'Kisan Credit Card — Assam Growers',
    };
  }
  if (lower.includes('fasal bima') || lower.includes('pmfby')) {
    return {
      src: '/images/assam-mustard.jpg',
      alt: 'Mustard crop fields in Assam covered under crop insurance',
      caption: 'Assam Crop Protection (PMFBY)',
    };
  }
  if (lower.includes('krishi') || lower.includes('mmkssy') || lower.includes('agriculture')) {
    return {
      src: '/images/assam-farmers.jpg',
      alt: 'Farmers transplanting rice seedlings in Golaghat, Assam',
      caption: 'MMKSSY Farm Tools Assistance',
    };
  }
  if (lower.includes('education') || lower.includes('scholarship')) {
    return {
      src: '/images/post-matric.jpg',
      alt: 'Students studying in an Assam university library',
      caption: 'Higher Education in Assam',
    };
  }
  if (lower.includes('women') || lower.includes('orunodoi') || lower.includes('mahila')) {
    return {
      src: '/images/women-shg.jpg',
      alt: 'Rural Indian women participating in community empowerment initiatives',
      caption: 'Women & Community Welfare',
    };
  }
  return {
    src: '/images/assam-assembly.jpg',
    alt: 'Assam Legislative Assembly complex in Dispur, Assam',
    caption: 'Government of Assam',
  };
}

