import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const RED = '#E32636';
const tools = [
  { title: 'AI Enhance', subtitle: 'Tingkatkan kualitas foto', icon: 'sparkles', kind: 'photo' },
  { title: 'Background Remover', subtitle: 'Hapus latar foto', icon: 'cut', kind: 'photo' },
  { title: 'AI Video Enhance', subtitle: 'Tingkatkan kualitas video', icon: 'videocam', kind: 'video' },
  { title: 'Photo Editor', subtitle: 'Edit dan atur foto', icon: 'image', kind: 'photo' },
  { title: 'Video Editor', subtitle: 'Edit video sederhana', icon: 'film', kind: 'video' }
] as const;

export default function HomeScreen() {
  const [picked, setPicked] = useState<string | null>(null);
  const [pickedType, setPickedType] = useState<string | null>(null);

  async function chooseMedia(kind: 'photo' | 'video' | 'any') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Izin diperlukan', 'Izinkan akses galeri untuk memilih media.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: kind === 'photo' ? ['images'] : kind === 'video' ? ['videos'] : ['images', 'videos'],
      allowsEditing: kind === 'photo',
      quality: 1
    });
    if (!result.canceled && result.assets[0]) {
      setPicked(result.assets[0].uri);
      setPickedType(result.assets[0].type ?? 'media');
      Alert.alert('Media dipilih', 'File berhasil dipilih. Mesin AI/editor akan dihubungkan pada tahap backend berikutnya.');
    }
  }

  return (
    <ScrollView style={s.page} contentContainerStyle={s.content}>
      <View style={s.header}>
        <View style={s.logo}><Ionicons name="aperture" size={26} color="#fff" /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.brand}>ZERO <Text style={{ color: RED }}>EDITING</Text></Text>
          <Text style={s.tagline}>Create beyond limits</Text>
        </View>
        <View style={s.online}><View style={s.dot} /><Text style={s.onlineText}>ONLINE</Text></View>
      </View>

      <View style={s.hero}>
        <Text style={s.eyebrow}>AI CREATIVE STUDIO</Text>
        <Text style={s.heroTitle}>Edit lebih mudah.{ '\n' }Hasil lebih maksimal.</Text>
        <Text style={s.heroDesc}>Satu tempat untuk meningkatkan kualitas foto, menghapus background, dan mengedit video.</Text>
        <Pressable style={s.primary} onPress={() => chooseMedia('any')}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={s.primaryText}>Mulai dari galeri</Text>
        </Pressable>
      </View>

      <View style={s.sectionHead}>
        <Text style={s.sectionTitle}>TOOLS</Text>
        <Text style={s.sectionHint}>PILIH FITUR</Text>
      </View>

      <View style={s.grid}>
        {tools.map((tool) => (
          <Pressable key={tool.title} style={s.tool} onPress={() => chooseMedia(tool.kind)}>
            <View style={s.toolIcon}><Ionicons name={tool.icon as any} size={23} color={RED} /></View>
            <Text style={s.toolTitle}>{tool.title}</Text>
            <Text style={s.toolSubtitle}>{tool.subtitle}</Text>
            <View style={s.arrow}><Ionicons name="arrow-forward" size={15} color="#fff" /></View>
          </Pressable>
        ))}
      </View>

      {picked && (
        <View style={s.preview}>
          <Text style={s.sectionTitle}>MEDIA TERPILIH</Text>
          {pickedType === 'video'
            ? <View style={s.videoPlaceholder}><Ionicons name="videocam" size={34} color={RED} /><Text style={s.muted}>Video siap diproses</Text></View>
            : <Image source={{ uri: picked }} style={s.previewImage} />}
          <Pressable style={s.secondary} onPress={() => chooseMedia('any')}><Text style={s.secondaryText}>Ganti media</Text></Pressable>
        </View>
      )}

      <View style={s.notice}>
        <Ionicons name="information-circle-outline" size={18} color="#F3B64B" />
        <Text style={s.noticeText}>Versi awal: dashboard dan pemilih media sudah disiapkan. Pemrosesan AI, penghapus background, timeline video, dan ekspor hasil memerlukan layanan/backend yang akan ditambahkan berikutnya.</Text>
      </View>
      <Text style={s.footer}>ZERO EDITING • VERSION 1.0.0</Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#101010' },
  content: { padding: 20, paddingTop: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 26 },
  logo: { width: 48, height: 48, borderRadius: 15, backgroundColor: RED, alignItems: 'center', justifyContent: 'center' },
  brand: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1.5 },
  tagline: { color: '#858585', fontSize: 11, marginTop: 3 },
  online: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: '#303030', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#39C779' },
  onlineText: { color: '#bbb', fontSize: 9, fontWeight: '800', letterSpacing: 1 },
  hero: { backgroundColor: '#1B1B1B', borderRadius: 22, borderWidth: 1, borderColor: '#303030', padding: 21, marginBottom: 28 },
  eyebrow: { color: RED, fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 12 },
  heroTitle: { color: '#fff', fontSize: 27, lineHeight: 33, fontWeight: '900' },
  heroDesc: { color: '#aaa', fontSize: 13, lineHeight: 20, marginTop: 10, marginBottom: 18 },
  primary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: RED, borderRadius: 13, paddingVertical: 13 },
  primaryText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  sectionHint: { color: '#777', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 11 },
  tool: { width: '48%', minHeight: 145, backgroundColor: '#1B1B1B', borderColor: '#303030', borderWidth: 1, borderRadius: 17, padding: 14 },
  toolIcon: { width: 42, height: 42, borderRadius: 13, backgroundColor: '#2B191B', alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
  toolTitle: { color: '#fff', fontSize: 13, fontWeight: '800' },
  toolSubtitle: { color: '#858585', fontSize: 10, marginTop: 5, lineHeight: 15 },
  arrow: { position: 'absolute', right: 12, bottom: 12, width: 25, height: 25, borderRadius: 9, backgroundColor: '#333', alignItems: 'center', justifyContent: 'center' },
  preview: { marginTop: 25, gap: 12 },
  previewImage: { width: '100%', height: 210, borderRadius: 16, resizeMode: 'contain', backgroundColor: '#1B1B1B' },
  videoPlaceholder: { height: 140, borderRadius: 16, backgroundColor: '#1B1B1B', alignItems: 'center', justifyContent: 'center', gap: 8 },
  muted: { color: '#aaa', fontSize: 12 },
  secondary: { borderWidth: 1, borderColor: '#444', borderRadius: 12, padding: 12, alignItems: 'center' },
  secondaryText: { color: '#fff', fontWeight: '700' },
  notice: { flexDirection: 'row', gap: 9, backgroundColor: '#211E17', borderColor: '#51432A', borderWidth: 1, padding: 13, borderRadius: 13, marginTop: 25 },
  noticeText: { color: '#C9B98F', flex: 1, fontSize: 10, lineHeight: 16 },
  footer: { textAlign: 'center', color: '#555', fontSize: 9, letterSpacing: 1.4, marginTop: 28 }
});
