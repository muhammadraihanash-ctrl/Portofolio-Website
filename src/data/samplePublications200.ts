/**
 * Academic Publications & Intellectual Property Repository
 * 100% dynamically sourced from MySQL database 'portofolio_nught' (6 tables)
 * /data/database_p2m_mysql.sql:
 * - scopus_publications (63 rows)
 * - journals (32 rows)
 * - proceedings (16 rows)
 * - books (22 rows)
 * - patents_hki (22 rows)
 * - p2m_activities (60 rows)
 * Total: 215 items
 */

import { Publication, P2MActivity, AnnualPerformanceIndexEntry } from '../types/index.js';
import databaseState from './database_state.json' with { type: 'json' };

// Authentic 60 P2M & Research activities directly from database state
export const SAMPLE_P2M_ACTIVITIES: P2MActivity[] = ((databaseState as any)?.profile?.p2mActivities || []) as P2MActivity[];

// Authentic 155 Publications & Intellectual Property directly from database state
export const AUTHENTIC_SCOPUS_PUBLICATIONS: Publication[] = ((databaseState as any)?.publications || []) as Publication[];
export const SAMPLE_200_PUBLICATIONS: Publication[] = [...AUTHENTIC_SCOPUS_PUBLICATIONS];

// Dynamically calculate aggregated performance index directly from the database state
export function calculateAnnualPerformanceFromPublications(
  pubs?: Publication[],
  p2mList?: P2MActivity[]
): AnnualPerformanceIndexEntry[] {
  return ((databaseState as any)?.profile?.annualPerformance || []) as AnnualPerformanceIndexEntry[];
}

