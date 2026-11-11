import React, { useMemo, useState } from 'react';
import {
  Alert, Image, Pressable, ScrollView, StatusBar, StyleSheet, Text,
  View, ActivityIndicator, useWindowDimensions
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as MediaLibrary from 'expo-media-library';
import { Ionicons } from '@expo/vector-icons';

const C = {
  bg: '#090A0D', panel: '#14161B', panel2: '#1B1E25', line: '#292D36',
  red: '#F04452', redDark: '#35171D', white: '#F7F7F8', muted: '#9297A2',
  green: '#45C486', amber: '#E8B65B'
};
type Media = { uri: string; type: 'image' | 'video'; width?: number; height?: number; name?: string };
type Tool = { title: string; desc: string; icon: keyof typeof Ionicons.glyphMap; kind: 'image'|'video'|'ai' };

const tools: Tool[] = [
  { title:'Photo Editor', desc:'Putar, balik, ubah ukuran, simpan', icon:'image-outline', kind:'image' },
  { title:'AI Enhance', desc:'Rencana pemrosesan foto AI', icon:'sparkles-outline', kind:'ai' },
  { title:'Background Remover', desc:'Hapus latar dengan layanan AI', icon:'cut-outline', kind:'ai' },
  { title:'Video Editor', desc:'Pilih video untuk alur edit', icon:'film-outline', kind:'video' },
  { title:'AI Video Enhance', desc:'Peningkatan video berbasis AI', icon:'videocam-outline', kind:'ai' }
];

function ActionButton({ icon, label, onPress, secondary=false, disabled=false }: {
  icon: keyof typeof Ionicons.glyphMap; label: string; onPress:()=>void; secondary?:boolean; disabled?:boolean
}) {
  return <Pressable disabled={disabled} onPress={onPress} style={({pressed})=>[
    secondary ? s.secondaryBtn : s.primaryBtn, disabled && {opacity:.45}, pressed && {opacity:.78}
  ]}>
    <Ionicons name={icon} size={18} color={secondary ? C.white : '#fff'} />
    <Text style={secondary ? s.secondaryText : s.primaryText}>{label}</Text>
  </Pressable>;
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 48 - 12) / 2;
  const [media, setMedia] = useState<Media|null>(null);
  const [busy, setBusy] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [quality, setQuality] = useState<'standard'|'high'>('high');
  const [resizePreset, setResizePreset] = useState<'original'|'1080'|'720'>('original');
  const [screen, setScreen] = useState<'home'|'editor'>('home');

  const isImage = media?.type === 'image';
  const previewTransform = useMemo(() => [
    { rotate: `${rotation}deg` },
    { scaleX: flipH ? -1 : 1 },
    { scaleY: flipV ? -1 : 1 }
  ], [rotation, flipH, flipV]);

  async function pick(kind: 'image'|'video'|'any') {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Izin galeri dibutuhkan', 'Izinkan akses foto dan video di pengaturan Android.');
        return;
      }
      const mediaTypes: ImagePicker.MediaType[] = kind === 'image' ? ['images'] : kind === 'video' ? ['videos'] : ['images','videos'];
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes, allowsEditing: kind === 'image', quality: 1, videoMaxDuration: 180
      });
      if (result.canceled || !result.assets?.[0]) return;
      const a = result.assets[0];
      const type = a.type === 'video' ? 'video' : 'image';
      setMedia({uri:a.uri,type,width:a.width,height:a.height,name:a.fileName ?? undefined});
      setRotation(0); setFlipH(false); setFlipV(false);
      setScreen(type === 'image' ? 'editor' : 'home');
      if (type === 'video') Alert.alert('Video dipilih', 'Video berhasil dimuat. Fitur pemotongan dan ekspor video akan ditambahkan setelah modul video tersedia.');
    } catch (e) {
      Alert.alert('Gagal membuka galeri', 'Coba lagi dan pastikan izin galeri aktif.');
    }
  }

  async function exportImage() {
    if (!media || !isImage) return;
    setBusy(true);
    try {
      const actions: ImageManipulator.Action[] = [];
      if (rotation % 360) actions.push({rotate: rotation});
      if (flipH) actions.push({flip: ImageManipulator.FlipType.Horizontal});
      if (flipV) actions.push({flip: ImageManipulator.FlipType.Vertical});
      if (resizePreset !== 'original' && media.width && media.height) {
        const targetWidth = Math.min(Number(resizePreset), media.width);
        const targetHeight = Math.round(media.height * targetWidth / media.width);
        actions.push({resize: {width: targetWidth, height: targetHeight}});
      }
      const result = await ImageManipulator.manipulateAsync(media.uri, actions, {
        compress: quality === 'high' ? 1 : 0.82, format: ImageManipulator.SaveFormat.JPEG
      });
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Izin simpan dibutuhkan', 'Izinkan Zero Editing menyimpan hasil ke galeri.');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(result.uri);
      Alert.alert('Berhasil disimpan', 'Hasil edit sudah tersimpan di galeri perangkat.');
    } catch (e) {
      Alert.alert('Ekspor gagal', 'Media tidak dapat diproses. Coba pilih foto lain.');
    } finally { setBusy(false); }
  }

  function openTool(tool: Tool) {
    if (tool.kind === 'image') { pick('image'); return; }
    if (tool.kind === 'video') { pick('video'); return; }
    Alert.alert(tool.title, 'Fitur ini memerlukan layanan AI online dan server pemrosesan. Tombol ini belum menjalankan proses AI, jadi tidak akan mengklaim hasil palsu.');
  }

  function resetEditor() { setRotation(0); setFlipH(false); setFlipV(false); setQuality('high'); setResizePreset('original'); }
  const header = <View style={s.header}>
    <View style={s.logo}><Ionicons name="aperture" size={25} color="#fff" /></View>
    <View style={{flex:1}}>
      <Text style={s.brand}>ZERO <Text style={{color:C.red}}>EDITING</Text></Text>
      <Text style={s.tagline}>CREATIVE STUDIO</Text>
    </View>
    <View style={s.online}><View style={s.onlineDot}/><Text style={s.onlineLabel}>READY</Text></View>
  </View>;

  return <View style={s.root}>
    <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
    {screen === 'editor' && media?.type === 'image' ? <>
      <View style={s.topBar}>
        <Pressable onPress={()=>setScreen('home')} style={s.back}><Ionicons name="arrow-back" size={22} color={C.white}/></Pressable>
        <View style={{flex:1}}><Text style={s.topTitle}>Photo Editor</Text><Text style={s.topSub}>Edit foto di perangkat</Text></View>
        <Pressable onPress={resetEditor} style={s.reset}><Ionicons name="refresh" size={17} color={C.white}/><Text style={s.resetText}>Reset</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={s.editorContent}>
        <View style={s.canvas}>
          <Image source={{uri:media.uri}} resizeMode="contain" style={[s.canvasImage,{transform:previewTransform}]}/>
        </View>
        <View style={s.metaRow}>
          <Text style={s.metaText}>{media.width ?? '—'} × {media.height ?? '—'} px</Text>
          <Text style={s.metaText}>Preview</Text>
        </View>
        <Text style={s.sectionTitle}>TRANSFORMASI</Text>
        <View style={s.controlGrid}>
          <Pressable style={s.control} onPress={()=>setRotation(v=>(v+90)%360)}><Ionicons name="refresh-outline" size={22} color={C.red}/><Text style={s.controlLabel}>Putar 90°</Text></Pressable>
          <Pressable style={s.control} onPress={()=>setFlipH(v=>!v)}><Ionicons name="swap-horizontal-outline" size={22} color={C.red}/><Text style={s.controlLabel}>Balik H</Text><Text style={s.controlState}>{flipH?'Aktif':'Nonaktif'}</Text></Pressable>
          <Pressable style={s.control} onPress={()=>setFlipV(v=>!v)}><Ionicons name="swap-vertical-outline" size={22} color={C.red}/><Text style={s.controlLabel}>Balik V</Text><Text style={s.controlState}>{flipV?'Aktif':'Nonaktif'}</Text></Pressable>
          <Pressable style={s.control} onPress={()=>pick('image')}><Ionicons name="images-outline" size={22} color={C.red}/><Text style={s.controlLabel}>Ganti Foto</Text></Pressable>
        </View>
        <Text style={s.sectionTitle}>UKURAN EKSPOR</Text>
        <View style={s.qualityRow}>
          {(['original','1080','720'] as const).map(value=><Pressable key={value} onPress={()=>setResizePreset(value)} style={[s.qualityOption,resizePreset===value&&s.qualityActive]}><Text style={[s.qualityTitle,resizePreset===value&&{color:C.white}]}>{value==='original'?'Asli':`${value} px`}</Text><Text style={s.qualityDesc}>{value==='original'?'Ukuran awal':'Lebar maksimal'}</Text></Pressable>)}
        </View>
        <Text style={s.sectionTitle}>KUALITAS EKSPOR</Text>
        <View style={s.qualityRow}>
          <Pressable onPress={()=>setQuality('standard')} style={[s.qualityOption,quality==='standard'&&s.qualityActive]}><Text style={[s.qualityTitle,quality==='standard'&&{color:C.white}]}>Standar</Text><Text style={s.qualityDesc}>Lebih ringan</Text></Pressable>
          <Pressable onPress={()=>setQuality('high')} style={[s.qualityOption,quality==='high'&&s.qualityActive]}><Text style={[s.qualityTitle,quality==='high'&&{color:C.white}]}>Tinggi</Text><Text style={s.qualityDesc}>Kualitas maksimal</Text></Pressable>
        </View>
        <ActionButton icon="download-outline" label={busy?'Memproses...':'Simpan ke Galeri'} onPress={exportImage} disabled={busy}/>
        {busy && <ActivityIndicator color={C.red} style={{marginTop:12}}/>}
        <Text style={s.helper}>Foto diproses di perangkat. File asli tidak ditimpa.</Text>
      </ScrollView>
    </> : <ScrollView contentContainerStyle={s.homeContent} showsVerticalScrollIndicator={false}>
      {header}
      <View style={s.hero}>
        <View style={s.heroBadge}><Ionicons name="sparkles" size={13} color={C.red}/><Text style={s.heroBadgeText}>YOUR ALL-IN-ONE EDITOR</Text></View>
        <Text style={s.heroTitle}>Kreasi lebih bebas.{"\n"}Hasil lebih maksimal.</Text>
        <Text style={s.heroDesc}>Edit foto dan siapkan video dalam satu studio kreatif.</Text>
        <ActionButton icon="add" label="Pilih dari Galeri" onPress={()=>pick('any')}/>
        <View style={s.heroFoot}><Ionicons name="shield-checkmark-outline" size={14} color={C.green}/><Text style={s.heroFootText}>Kontrol file tetap di perangkatmu</Text></View>
      </View>

      <View style={s.sectionHeader}><Text style={s.sectionTitle}>TOOLS EDITING</Text><Text style={s.sectionHint}>PILIH FITUR</Text></View>
      <View style={s.toolGrid}>
        {tools.map(tool=><Pressable key={tool.title} onPress={()=>openTool(tool)} style={({pressed})=>[s.toolCard,{width:cardWidth},pressed&&{borderColor:C.red,opacity:.86}]}>
          <View style={s.toolIcon}><Ionicons name={tool.icon} size={23} color={C.red}/></View>
          <Text style={s.toolTitle}>{tool.title}</Text>
          <Text style={s.toolDesc}>{tool.desc}</Text>
          <View style={s.toolArrow}><Ionicons name="arrow-forward" size={15} color={C.white}/></View>
          {tool.kind==='ai' && <View style={s.soon}><Text style={s.soonText}>AI ONLINE</Text></View>}
        </Pressable>)}
      </View>

      {media?.type==='video' && <View style={s.videoCard}>
        <View style={s.videoIcon}><Ionicons name="videocam" size={24} color={C.red}/></View>
        <View style={{flex:1}}><Text style={s.videoTitle}>Video terpilih</Text><Text style={s.videoDesc} numberOfLines={1}>{media.name ?? 'Video dari galeri'}</Text></View>
        <Pressable onPress={()=>pick('video')}><Ionicons name="repeat" size={20} color={C.white}/></Pressable>
      </View>}

      <View style={s.infoCard}><Ionicons name="information-circle-outline" size={19} color={C.amber}/><View style={{flex:1}}><Text style={s.infoTitle}>Tentang fitur AI</Text><Text style={s.infoText}>Photo Editor lokal sudah bisa memutar, membalik, dan menyimpan foto. Enhance AI, penghapus background, dan pemrosesan video memerlukan backend online yang akan disambungkan pada tahap berikutnya.</Text></View></View>
      <Text style={s.footer}>ZERO EDITING  •  VERSION 1.1</Text>
    </ScrollView>}
  </View>;
}

const s = StyleSheet.create({
  root:{flex:1,backgroundColor:C.bg},
  homeContent:{paddingHorizontal:18,paddingTop:22,paddingBottom:34},
  header:{flexDirection:'row',alignItems:'center',gap:11,marginBottom:22},
  logo:{width:46,height:46,borderRadius:15,backgroundColor:C.red,alignItems:'center',justifyContent:'center'},
  brand:{fontSize:17,fontWeight:'900',letterSpacing:1.1,color:C.white},
  tagline:{fontSize:9,fontWeight:'800',letterSpacing:1.7,color:C.muted,marginTop:4},
  online:{flexDirection:'row',alignItems:'center',gap:6,borderWidth:1,borderColor:C.line,paddingHorizontal:10,paddingVertical:7,borderRadius:20},
  onlineDot:{width:6,height:6,borderRadius:3,backgroundColor:C.green},
  onlineLabel:{fontSize:9,fontWeight:'900',letterSpacing:1,color:C.muted},
  hero:{backgroundColor:C.panel,borderRadius:23,borderWidth:1,borderColor:C.line,padding:20,marginBottom:27,overflow:'hidden'},
  heroBadge:{flexDirection:'row',alignItems:'center',gap:6,marginBottom:13},
  heroBadgeText:{fontSize:9,fontWeight:'900',letterSpacing:1.5,color:C.red},
  heroTitle:{fontSize:27,lineHeight:34,fontWeight:'900',letterSpacing:-.6,color:C.white},
  heroDesc:{fontSize:13,lineHeight:20,color:C.muted,marginTop:9,marginBottom:17},
  primaryBtn:{minHeight:49,backgroundColor:C.red,borderRadius:14,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9,paddingHorizontal:16},
  primaryText:{fontSize:14,fontWeight:'800',color:'#fff'},
  heroFoot:{flexDirection:'row',alignItems:'center',gap:6,marginTop:14},
  heroFootText:{fontSize:10,color:C.muted},
  sectionHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:13},
  sectionTitle:{fontSize:13,fontWeight:'900',letterSpacing:1.1,color:C.white,marginBottom:12},
  sectionHint:{fontSize:9,fontWeight:'800',letterSpacing:1.2,color:C.muted},
  toolGrid:{flexDirection:'row',flexWrap:'wrap',gap:12},
  toolCard:{minHeight:160,backgroundColor:C.panel,borderRadius:17,borderWidth:1,borderColor:C.line,padding:14},
  toolIcon:{width:41,height:41,borderRadius:13,backgroundColor:C.redDark,alignItems:'center',justifyContent:'center',marginBottom:12},
  toolTitle:{fontSize:13,fontWeight:'800',color:C.white,marginBottom:5},
  toolDesc:{fontSize:10,lineHeight:15,color:C.muted,paddingRight:2},
  toolArrow:{position:'absolute',right:11,bottom:11,width:26,height:26,borderRadius:9,backgroundColor:C.panel2,alignItems:'center',justifyContent:'center'},
  soon:{position:'absolute',right:10,top:10,backgroundColor:C.redDark,borderRadius:7,paddingHorizontal:6,paddingVertical:4},
  soonText:{fontSize:7,fontWeight:'900',letterSpacing:.6,color:'#FF9AA2'},
  infoCard:{flexDirection:'row',gap:10,backgroundColor:'#211D16',borderWidth:1,borderColor:'#4B3C25',borderRadius:15,padding:13,marginTop:23},
  infoTitle:{fontSize:12,fontWeight:'800',color:C.white,marginBottom:5},
  infoText:{fontSize:10,lineHeight:16,color:'#C9B98F'},
  footer:{fontSize:9,letterSpacing:1.3,textAlign:'center',color:'#5D626D',marginTop:26},
  topBar:{height:66,flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:16,borderBottomWidth:1,borderBottomColor:C.line},
  back:{width:38,height:38,borderRadius:12,backgroundColor:C.panel2,alignItems:'center',justifyContent:'center'},
  topTitle:{fontSize:16,fontWeight:'900',color:C.white},
  topSub:{fontSize:10,color:C.muted,marginTop:3},
  reset:{flexDirection:'row',alignItems:'center',gap:5,padding:9},
  resetText:{fontSize:11,fontWeight:'700',color:C.white},
  editorContent:{padding:18,paddingBottom:36},
  canvas:{height:310,backgroundColor:'#111318',borderWidth:1,borderColor:C.line,borderRadius:18,alignItems:'center',justifyContent:'center',overflow:'hidden'},
  canvasImage:{width:'88%',height:'88%'},
  metaRow:{flexDirection:'row',justifyContent:'space-between',marginTop:9,marginBottom:23},
  metaText:{fontSize:10,color:C.muted},
  controlGrid:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:23},
  control:{width:'48%',minHeight:92,backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:14,padding:13,justifyContent:'center',gap:5},
  controlLabel:{fontSize:12,fontWeight:'800',color:C.white},
  controlState:{fontSize:9,color:C.muted},
  qualityRow:{flexDirection:'row',gap:10,marginBottom:17},
  qualityOption:{flex:1,backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:13,padding:13},
  qualityActive:{borderColor:C.red,backgroundColor:C.redDark},
  qualityTitle:{fontSize:12,fontWeight:'800',color:C.muted},
  qualityDesc:{fontSize:9,color:C.muted,marginTop:4},
  secondaryBtn:{minHeight:45,borderRadius:13,borderWidth:1,borderColor:C.line,backgroundColor:C.panel2,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8,paddingHorizontal:14},
  secondaryText:{fontSize:13,fontWeight:'700',color:C.white},
  helper:{fontSize:10,color:C.muted,textAlign:'center',marginTop:12},
  videoCard:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:C.panel,borderWidth:1,borderColor:C.line,borderRadius:15,padding:13,marginTop:20},
  videoIcon:{width:42,height:42,borderRadius:12,backgroundColor:C.redDark,alignItems:'center',justifyContent:'center'},
  videoTitle:{fontSize:12,fontWeight:'800',color:C.white},
  videoDesc:{fontSize:10,color:C.muted,marginTop:4}
});
