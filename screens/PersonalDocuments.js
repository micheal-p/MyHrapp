// screens/PersonalDocuments.js - WEB PDF FIX
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  Dimensions,
  Linking,
} from 'react-native';
import { WebView } from 'react-native-webview';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { uploadAPI, documentAPI } from '../services/api';
import { DocumentIcon, CloseIcon, DownloadIcon, TrashIcon, EyeIcon } from '../components/Icons';
import Colors from '../constants/colors';

const { width, height } = Dimensions.get('window');

export default function PersonalDocuments({ navigation }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [previewModal, setPreviewModal] = useState(false);
  const [previewURL, setPreviewURL] = useState('');
  const [previewName, setPreviewName] = useState('');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await documentAPI.getMyDocuments();
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
      Alert.alert('Error', 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const pickAndUpload = async () => {
    try {
      setUploading(true);
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: false,
      });

      if (result.canceled || !result.assets?.[0]) {
        setUploading(false);
        return;
      }

      const asset = result.assets[0];
      const { uri, name, mimeType, size } = asset;

      if (size > 5 * 1024 * 1024) {
        Alert.alert('Error', 'File must be under 5MB');
        setUploading(false);
        return;
      }

      await uploadAPI.uploadCV(uri, name, mimeType);
      await loadDocuments();
      Alert.alert('Success', `${name} uploaded successfully!`);
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', error.message || 'Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const openPreview = (doc) => {
    // FOR WEB: Open in new tab instead of modal
    if (Platform.OS === 'web') {
      window.open(doc.uri, '_blank');
    } else {
      // FOR MOBILE: Use modal with WebView
      setPreviewURL(doc.uri);
      setPreviewName(doc.name);
      setPreviewModal(true);
    }
  };

  const downloadDocument = async () => {
    try {
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = previewURL;
        link.download = previewName;
        link.click();
      } else {
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          Linking.openURL(previewURL).catch(() => {});
          return;
        }
        const localUri = FileSystem.cacheDirectory + previewName;
        const downloadResult = await FileSystem.downloadAsync(previewURL, localUri);
        await Sharing.shareAsync(downloadResult.uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
    } catch (error) {
      console.error('Download error:', error);
      Linking.openURL(previewURL).catch(() => {});
    }
  };

  const deleteDocument = (doc) => {
    Alert.alert('Delete Document', `Delete "${doc.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await documentAPI.deleteDocument(doc.id);
            await loadDocuments();
            Alert.alert('Success', 'Document deleted');
          } catch (error) {
            Alert.alert('Error', 'Failed to delete');
          }
        },
      },
    ]);
  };

  const formatSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>My Documents</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      {/* MAIN CONTENT */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* UPLOAD CARD */}
        <TouchableOpacity style={styles.uploadCard} onPress={pickAndUpload} disabled={uploading}>
          <DocumentIcon size={40} color={Colors.primary} />
          <Text style={styles.uploadText}>{uploading ? 'Uploading...' : 'Upload Resume / CV'}</Text>
          <Text style={styles.uploadSubtext}>PDF, DOC, DOCX • Max 5MB</Text>
          {uploading && <ActivityIndicator style={styles.loader} color={Colors.primary} />}
        </TouchableOpacity>

        {/* EMPTY STATE */}
        {documents.length === 0 ? (
          <View style={styles.empty}>
            <DocumentIcon size={60} color={Colors.mediumGray} />
            <Text style={styles.emptyText}>No documents</Text>
            <Text style={styles.emptySubtext}>Upload your CV to apply for jobs</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {documents.map(doc => (
              <View key={doc.id} style={styles.docCard}>
                <View style={styles.docInfo}>
                  <DocumentIcon size={32} color={Colors.primary} />
                  <View style={styles.docDetails}>
                    <Text style={styles.docName} numberOfLines={1}>{doc.name}</Text>
                    <Text style={styles.docMeta}>
                      {formatSize(doc.size)} • {new Date(doc.uploadedAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>

                {/* ACTION BUTTONS */}
                <View style={styles.docActions}>
                  <TouchableOpacity style={styles.viewBtn} onPress={() => openPreview(doc)}>
                    <EyeIcon size={18} color={Colors.white} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteDocument(doc)}>
                    <TrashIcon size={18} color={Colors.white} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* PDF PREVIEW MODAL - ONLY FOR MOBILE */}
      {Platform.OS !== 'web' && (
        <Modal visible={previewModal} animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>{previewName}</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setPreviewModal(false)}>
                <CloseIcon size={24} color={Colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <WebView
              source={{ uri: previewURL }}
              style={styles.webview}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webviewLoader}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.loadingText}>Loading PDF...</Text>
                </View>
              )}
              javaScriptEnabled
              domStorageEnabled
              scalesPageToFit
              allowFileAccess
              allowUniversalAccessFromFileURLs
              mixedContentMode="compatibility"
              originWhitelist={['*']}
              onError={() => Alert.alert('Error', 'Could not load PDF')}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.downloadBtn} onPress={downloadDocument}>
                <DownloadIcon size={20} color={Colors.white} />
                <Text style={styles.downloadText}>Download PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// === STYLES (NO CHANGES) ===
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightGray },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGray,
  },
  title: { fontSize: 24, fontWeight: '700', color: Colors.textPrimary },
  backText: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
  scroll: { flex: 1 },
  content: { padding: 24 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  uploadCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  uploadText: { fontSize: 18, fontWeight: '600', color: Colors.textPrimary, marginTop: 12 },
  uploadSubtext: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  loader: { marginTop: 12 },

  empty: { alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 18, fontWeight: '600', color: Colors.textSecondary, marginTop: 16 },
  emptySubtext: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', marginTop: 8 },

  list: { gap: 12 },
  docCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    overflow: 'hidden',
  },
  docInfo: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    flex: 1, 
    marginRight: 8 
  },
  docDetails: { 
    marginLeft: 12, 
    flex: 1, 
    flexShrink: 1 
  },
  docName: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: Colors.textPrimary,
    flexShrink: 1 
  },
  docMeta: { 
    fontSize: 12, 
    color: Colors.textSecondary, 
    marginTop: 2 
  },

  docActions: { 
    flexDirection: 'row', 
    gap: 6, 
    alignItems: 'center' 
  },
  viewBtn: {
    width: 36,
    height: 36,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContainer: { flex: 1, backgroundColor: Colors.white },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, flex: 1, marginRight: 12 },
  closeBtn: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: Colors.lightGray, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  webview: { flex: 1 },
  webviewLoader: { 
    ...StyleSheet.absoluteFillObject, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: Colors.white 
  },
  loadingText: { marginTop: 12, color: Colors.textSecondary, fontSize: 16 },
  modalFooter: { 
    padding: 20, 
    borderTopWidth: 1, 
    borderTopColor: Colors.lightGray 
  },
  downloadBtn: { 
    flexDirection: 'row', 
    backgroundColor: Colors.primary, 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8 
  },
  downloadText: { 
    color: Colors.white, 
    fontWeight: '700', 
    fontSize: 16 
  },
});