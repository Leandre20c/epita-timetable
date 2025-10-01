// app/select-group.tsx

import { router } from 'expo-router';
import { ChevronRight, Search, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalendarService } from '../services/CalendarService';
import { GroupNode, GroupService } from '../services/GroupeService';
import { COLORS } from '../styles/screenStyles';
import EventEmitter from '../utils/EventEmitter';

export default function SelectGroupScreen() {
  const [groups, setGroups] = useState<GroupNode[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<GroupNode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const hierarchy = await GroupService.fetchGroupHierarchy();
      setGroups(hierarchy);
      setFilteredGroups(hierarchy);
    } catch (error) {
      console.error('Erreur chargement groupes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredGroups(groups);
      return;
    }

    const results = GroupService.searchGroups(groups, query);
    setFilteredGroups(results);
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const selectGroup = async (group: GroupNode) => {
  await GroupService.saveSelectedGroup(group);
    
    // ✅ Vide le cache du calendrier
    await CalendarService.clearCache();

    EventEmitter.emit('groupChanged');
    
    router.back();
  };

  const renderGroup = (group: GroupNode, depth: number = 0) => {
    const hasChildren = group.children.length > 0;
    const isExpanded = expandedIds.has(group.id);

    return (
      <View key={group.id}>
        <TouchableOpacity
          style={[styles.groupItem, { paddingLeft: 16 + depth * 20 }]}
          onPress={() => {
            if (hasChildren) {
              toggleExpand(group.id);
            } else {
              selectGroup(group);
            }
          }}
        >
          <View style={styles.groupInfo}>
            {hasChildren && (
              <ChevronRight
                size={20}
                color={COLORS.light.text.secondary}
                style={{
                  transform: [{ rotate: isExpanded ? '90deg' : '0deg' }],
                  marginRight: 8,
                }}
              />
            )}
            <View
              style={[styles.colorDot, { backgroundColor: group.color }]}
            />
            <View style={styles.groupText}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.groupCount}>{group.count} étudiants</Text>
            </View>
          </View>
        </TouchableOpacity>

        {hasChildren && isExpanded && (
          <View>
            {group.children.map(child => renderGroup(child, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelButton}>Annuler</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Choisir un groupe</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.light.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un groupe..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <X size={20} color={COLORS.light.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Groups List */}
      <FlatList
        data={searchQuery ? filteredGroups : groups}
        renderItem={({ item }) => renderGroup(item)}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  cancelButton: {
    fontSize: 16,
    color: COLORS.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.light.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.light.text.primary,
  },
  listContent: {
    paddingBottom: 20,
  },
  groupItem: {
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingRight: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  groupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  groupText: {
    flex: 1,
  },
  groupName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.light.text.primary,
    marginBottom: 2,
  },
  groupCount: {
    fontSize: 13,
    color: COLORS.light.text.secondary,
  },
});