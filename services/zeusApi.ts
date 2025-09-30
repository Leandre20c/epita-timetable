// services/zeusApi.ts

export class ZeusAPI {
  private static BASE_URL = 'https://zeus.ionis-it.com';

  static async fetchGroupHierarchy() {
    try {
      console.log('🌳 Fetching group hierarchy from ZEUS...');
      
      const response = await fetch(`${this.BASE_URL}/api/group/hierarchy`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Hierarchy data:');
      console.log(JSON.stringify(data, null, 2));
      
      return data;
    } catch (error) {
      console.error('❌ Error fetching hierarchy:', error);
      throw error;
    }
  }
}

// Teste immédiatement
ZeusAPI.fetchGroupHierarchy();