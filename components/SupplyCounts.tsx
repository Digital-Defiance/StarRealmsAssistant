import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import SuperCapsText from '@/components/SuperCapsText';
import { useGameContext } from '@/components/GameContext';
import { IBaseKingdom } from '@/game/interfaces/set-kingdom/base';
import { IProsperityKingdom } from '@/game/interfaces/set-kingdom/prosperity';

const SupplyCounts: React.FC = () => {
  const { gameState } = useGameContext();

  const supplyCards: (keyof IBaseKingdom | keyof IProsperityKingdom)[] = [
    'estates',
    'duchies',
    'provinces',
    'coppers',
    'silvers',
    'golds',
    'curses',
    'colonies',
    'platinums',
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      maxWidth: 600,
      alignSelf: 'center',
    },
    header: {
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      color: 'gray',
      marginTop: 8,
    },
    listItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    cardName: {
      fontSize: 16,
    },
    quantity: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    note: {
      fontSize: 14,
      color: 'gray',
      marginTop: 16,
    },
  });

  const renderItem = ({ item }: { item: keyof IBaseKingdom | keyof IProsperityKingdom }) => {
    const quantity = gameState.supply[item] ?? 0;
    if (quantity === -1) return null;
    const cardName = item.charAt(0).toUpperCase() + item.slice(1);

    return (
      <View style={styles.listItem}>
        <Text style={styles.cardName}>{cardName}</Text>
        <Text style={styles.quantity}>{quantity}</Text>
      </View>
    );
  };

  const getSetInfo = () => {
    const playerCount = gameState.players.length;
    if (playerCount <= 2) return '1 set (2 players)';
    if (playerCount <= 4) return '1 set (3-4 players)';
    return '2 sets (5-6 players)';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SuperCapsText fontSize={28}>Kingdom Supply</SuperCapsText>
        <Text style={styles.subtitle}>{getSetInfo()}</Text>
      </View>
      <FlatList data={supplyCards} renderItem={renderItem} keyExtractor={(item) => item} />
      <Text style={styles.note}>Note: Supply counts include trashed cards.</Text>
    </View>
  );
};

export default SupplyCounts;
