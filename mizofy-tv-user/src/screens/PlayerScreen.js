import React, { useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, PanResponder } from 'react-native';
import { Video, ResizeMode, Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Brightness from 'expo-brightness';
import { WebView } from 'react-native-webview';
import UnityAdBanner from '../components/UnityAdBanner';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PlayerScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const video = useRef(null);
  const [status, setStatus] = useState({});
  const [volume, setVolume] = useState(1.0);
  const [brightness, setBrightnessVal] = useState(0.5);
  const [showVolumeBar, setShowVolumeBar] = useState(false);
  const [showBrightnessBar, setShowBrightnessBar] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [controlsVisible, setControlsVisible] = useState(true);
  const timerRef = useRef(null);
  const { channel } = route.params;

  useFocusEffect(
    useCallback(() => {
      // Get current brightness on enter
      Brightness.getBrightnessAsync().then(b => setBrightnessVal(b)).catch(() => {});
      
      // Auto hide controls initially
      startTimer();

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      };
    }, [])
  );

  const startTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 2000);
  };

  const showControls = () => {
    setControlsVisible(true);
    startTimer();
  };

  // Volume controls
  const adjustVolume = async (delta) => {
    const newVol = Math.min(1.0, Math.max(0, volume + delta));
    setVolume(newVol);
    if (video.current) {
      await video.current.setVolumeAsync(newVol);
    }
    setShowVolumeBar(true);
    setTimeout(() => setShowVolumeBar(false), 1500);
  };

  // Brightness controls
  const adjustBrightness = async (delta) => {
    const newBright = Math.min(1.0, Math.max(0.05, brightness + delta));
    setBrightnessVal(newBright);
    try {
      await Brightness.setBrightnessAsync(newBright);
    } catch (e) { console.log('Brightness error:', e); }
    setShowBrightnessBar(true);
    setTimeout(() => setShowBrightnessBar(false), 1500);
  };

  // Play/Pause toggle
  const togglePlayPause = async () => {
    showControls();
    if (video.current) {
      if (isPlaying) {
        await video.current.pauseAsync();
      } else {
        await video.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const getYouTubeEmbedUrl = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : url;
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&showinfo=0&rel=0`;
  };

  const isNativeVideo = channel.type === 'stream' || channel.type === 'dash' || !channel.type;

  return (
    <View style={styles.container}>
      <View style={styles.videoContainer}>
        {isNativeVideo ? (
          <Video
            ref={video}
            style={styles.video}
            source={{ uri: channel.url }}
            useNativeControls={false}
            resizeMode={ResizeMode.CONTAIN}
            isLooping={false}
            volume={volume}
            onPlaybackStatusUpdate={s => {
              setStatus(s);
              if (s.isPlaying !== undefined) setIsPlaying(s.isPlaying);
            }}
            onFullscreenUpdate={async ({ fullscreenUpdate }) => {
              if (fullscreenUpdate === 1) {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
              } else if (fullscreenUpdate === 3 || fullscreenUpdate === 2) {
                await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
              }
            }}
            shouldPlay
          />
        ) : (
          <WebView
            style={styles.video}
            source={{ uri: channel.type === 'youtube' ? getYouTubeEmbedUrl(channel.url) : channel.url }}
            allowsFullscreenVideo={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            scalesPageToFit={true}
          />
        )}

        {/* BACK BUTTON */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        {isNativeVideo && (
          <>
            {/* VOLUME INDICATOR */}
            {showVolumeBar && (
              <View style={styles.indicatorOverlay}>
                <Ionicons name={volume === 0 ? "volume-mute" : "volume-high"} size={28} color="#fff" />
                <View style={styles.indicatorBarBg}>
                  <View style={[styles.indicatorBarFill, { width: `${volume * 100}%`, backgroundColor: '#ff2d2d' }]} />
                </View>
                <Text style={styles.indicatorText}>{Math.round(volume * 100)}%</Text>
              </View>
            )}

            {/* BRIGHTNESS INDICATOR */}
            {showBrightnessBar && (
              <View style={styles.indicatorOverlay}>
                <Ionicons name="sunny" size={28} color="#fff" />
                <View style={styles.indicatorBarBg}>
                  <View style={[styles.indicatorBarFill, { width: `${brightness * 100}%`, backgroundColor: '#ffcc00' }]} />
                </View>
                <Text style={styles.indicatorText}>{Math.round(brightness * 100)}%</Text>
              </View>
            )}

            {/* PLAYER CONTROLS OVERLAY */}
            {controlsVisible && (
              <View style={styles.controlsOverlay}>
                {/* LEFT: Brightness */}
                <View style={styles.controlColumn}>
                  <TouchableOpacity style={styles.controlBtn} onPress={() => { adjustBrightness(0.1); showControls(); }}>
                    <Ionicons name="sunny" size={18} color="#ffcc00" />
                    <Ionicons name="add" size={12} color="#fff" style={styles.miniIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.controlBtn} onPress={() => { adjustBrightness(-0.1); showControls(); }}>
                    <Ionicons name="sunny-outline" size={18} color="#ffcc00" />
                    <Ionicons name="remove" size={12} color="#fff" style={styles.miniIcon} />
                  </TouchableOpacity>
                </View>

                {/* CENTER: Play/Pause + Fullscreen */}
                <View style={styles.centerControls}>
                  <TouchableOpacity style={styles.playBtn} onPress={togglePlayPause}>
                    <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.fullscreenBtn} 
                    onPress={() => { video.current?.presentFullscreenPlayer(); showControls(); }}
                  >
                    <Ionicons name="expand" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* RIGHT: Volume */}
                <View style={styles.controlColumn}>
                  <TouchableOpacity style={styles.controlBtn} onPress={() => { adjustVolume(0.1); showControls(); }}>
                    <Ionicons name="volume-high" size={18} color="#ff2d2d" />
                    <Ionicons name="add" size={12} color="#fff" style={styles.miniIcon} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.controlBtn} onPress={() => { adjustVolume(-0.1); showControls(); }}>
                    <Ionicons name="volume-low" size={18} color="#ff2d2d" />
                    <Ionicons name="remove" size={12} color="#fff" style={styles.miniIcon} />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* TAP DETECTOR TO SHOW CONTROLS */}
            {!controlsVisible && (
              <TouchableOpacity 
                style={StyleSheet.absoluteFill} 
                onPress={showControls} 
                activeOpacity={1} 
              />
            )}
          </>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{channel.title}</Text>
        <Text style={styles.category}>{channel.category} • {channel.type === 'youtube' ? 'YouTube' : channel.type === 'embed' ? 'Web Embed' : 'Live Streaming'}</Text>
        
        <View style={styles.adSection}>
          <UnityAdBanner />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Ionicons name="eye" size={20} color="#ff2d2d" />
            <Text style={styles.statText}>  Live</Text>
          </View>
          {isNativeVideo && (
            <TouchableOpacity style={styles.statBox} onPress={() => adjustVolume(volume > 0 ? -volume : 1)}>
              <Ionicons name={volume === 0 ? "volume-mute" : "volume-high"} size={20} color="#ff2d2d" />
              <Text style={styles.statText}>  {volume === 0 ? 'Unmute' : 'Mute'}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  videoContainer: { width: '100%', height: SCREEN_WIDTH * (9 / 16), backgroundColor: '#000' },
  video: { flex: 1 },
  backButton: { 
    position: 'absolute', top: 40, left: 15, zIndex: 10, 
    padding: 8, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20 
  },

  // Controls overlay at bottom of video
  controlsOverlay: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
    paddingHorizontal: 10, paddingBottom: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  controlColumn: { alignItems: 'center', gap: 4 },
  controlBtn: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20,
    paddingVertical: 5, paddingHorizontal: 8,
  },
  miniIcon: { marginLeft: 1 },
  centerControls: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  playBtn: {
    backgroundColor: 'rgba(255,45,45,0.7)', borderRadius: 25,
    width: 46, height: 46, alignItems: 'center', justifyContent: 'center',
  },
  fullscreenBtn: {
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 18,
    padding: 6,
  },

  // Volume/Brightness overlay indicator
  indicatorOverlay: {
    position: 'absolute', top: '40%', alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: 25,
    paddingVertical: 8, paddingHorizontal: 16, gap: 10,
  },
  indicatorBarBg: {
    width: 100, height: 5, backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 3,
  },
  indicatorBarFill: { height: '100%', borderRadius: 3 },
  indicatorText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },

  infoContainer: { padding: 20, flex: 1 },
  title: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 5 },
  category: { color: '#888', fontSize: 14, marginBottom: 20 },
  adSection: { marginVertical: 10 },
  statsRow: { flexDirection: 'row', marginTop: 20, gap: 12 },
  statBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1a1a1a', padding: 12, borderRadius: 10 },
  statText: { color: '#fff', fontWeight: 'bold' }
});
