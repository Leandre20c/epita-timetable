// services/groupExtractor.ts

import type { GroupInfo } from '../types/groups';
import { ICSParser } from './ICSParser';

/**
 * Extrait tous les groupes uniques depuis un fichier ICS
 * @param icsUrl - URL du fichier ICS à parser
 * @returns Promise<GroupInfo[]> - Liste des groupes trouvés
 */
export async function extractGroupsFromICS(icsUrl: string): Promise<GroupInfo[]> {
  try {
    console.log('📥 Fetching ICS from:', icsUrl);
    
    const response = await fetch(icsUrl, {
      headers: {
        'Accept': 'text/calendar',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ICS: ${response.status} ${response.statusText}`);
    }
    
    const icsContent = await response.text();
    console.log(`📄 ICS size: ${icsContent.length} characters`);
    
    if (!icsContent || icsContent.length === 0) {
      throw new Error('ICS content is empty');
    }
    
    const events = ICSParser.parseICS(icsContent);
    console.log(`📅 Parsed ${events.length} events`);
    
    if (events.length === 0) {
      console.warn('⚠️ No events found in ICS');
      return [];
    }
    
    // 🔍 DEBUG: Afficher les 5 premiers événements
    console.log('🔍 DEBUG: Premiers événements:');
    events.slice(0, 5).forEach((event, i) => {
      console.log(`Event ${i}:`);
      console.log('  Summary:', event.summary);
      console.log('  Description:', event.description);
      console.log('  Location:', event.location);
    });
    
    const groupsSet = new Set<string>();
    
    events.forEach(event => {
      const text = `${event.summary || ''} ${event.description || ''}`;
      const groups = extractGroupsFromText(text);
      
      groups.forEach(g => groupsSet.add(g));
    });
    
    if (groupsSet.size === 0) {
      console.warn('⚠️ No groups found in events');
      return [];
    }
    
    console.log(`✅ Found ${groupsSet.size} unique groups`);
    
    return Array.from(groupsSet)
      .map(parseGroupString)
      .filter((g): g is GroupInfo => g !== null)
      .sort((a, b) => a.fullPath.localeCompare(b.fullPath));
      
  } catch (error) {
    console.error('❌ Error extracting groups from ICS:', error);
    throw error;
  }
}

function extractGroupsFromText(text: string): string[] {
  // Regex actuelle
  const regex = /[BM]\d+-[A-Z]+-GR\d+/gi;
  const matches = text.match(regex);
  
  if (!matches) return [];
  
  return [...new Set(matches.map(g => g.toUpperCase()))];
}

/**
 * Parse un identifiant de groupe en objet structuré
 * @param groupStr - Ex: "B3-DEV-GR1"
 * @returns GroupInfo | null
 */
function parseGroupString(groupStr: string): GroupInfo | null {
  const parts = groupStr.split('-');
  
  // Validation du format
  if (parts.length !== 3) {
    console.warn(`⚠️ Invalid group format: ${groupStr}`);
    return null;
  }
  
  const [year, specialization, group] = parts;
  
  // Validation des composants
  if (!year || !specialization || !group) {
    return null;
  }
  
  // Validation du format year (B1, B2, M1, etc.)
  if (!/^[BM]\d+$/.test(year)) {
    return null;
  }
  
  // Validation du format group (GR1, GR2, etc.)
  if (!/^GR\d+$/.test(group)) {
    return null;
  }
  
  return {
    fullPath: groupStr,
    year,
    specialization,
    group
  };
}