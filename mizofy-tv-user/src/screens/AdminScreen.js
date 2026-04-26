import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminScreen() {
  const [sliders, setSliders] = useState(['', '', '', '', '']);

  const updateSliderAddress = (text, index) => {
    let newSliders = [...sliders];
    newSliders[index] = text;
    setSliders(newSliders);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Admin Control Panel</Text>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Manage Banner Sliders (Max 5)</Text>
        {sliders.map((s, i) => (
          <View key={i} style={styles.sliderInputGroup}>
            <Text style={styles.sliderLabel}>Slider {i + 1} Image URL</Text>
            <TextInput 
              style={styles.input} 
              placeholder={`Enter Banner ${i + 1} Image URL`} 
              placeholderTextColor="#666" 
              value={s}
              onChangeText={(text) => updateSliderAddress(text, i)}
            />
          </View>
        ))}
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>SAVE SLIDERS TO FIREBASE</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Manage Links</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Telegram Group Link" 
          placeholderTextColor="#666" 
          value="https://t.me/ummotv"
        />
        <TextInput 
          style={styles.input} 
          placeholder="App Share Link" 
          placeholderTextColor="#666" 
          value="https://ummotv.com/download"
        />
        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>SAVE SETTINGS</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Quick Stats</Text>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Active Channels:</Text>
          <Text style={styles.statValue}>2</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Total Categories:</Text>
          <Text style={styles.statValue}>3</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statLabel}>Registered Users:</Text>
          <Text style={styles.statValue}>104</Text>
        </View>
      </View>
      <View style={{height: 50}} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', padding: 20 },
  header: { color: '#ff2d2d', fontSize: 24, fontWeight: 'bold', marginTop: 40, marginBottom: 20 },
  card: { backgroundColor: '#1a1a1a', padding: 20, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: '#2a2a2a' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  sliderInputGroup: { marginBottom: 10 },
  sliderLabel: { color: '#aaa', fontSize: 12, marginBottom: 5 },
  input: { backgroundColor: '#0a0a0a', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  saveBtn: { backgroundColor: '#ff2d2d', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#333' },
  statLabel: { color: '#888' },
  statValue: { color: '#ff2d2d', fontWeight: 'bold' }
});
