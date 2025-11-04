// screens/EmployerProfileSetup.js (COMPLETE - ENHANCED ERROR LOGGING)
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import { profileAPI, uploadAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { Country, State, City } from 'country-state-city';
import Colors from '../constants/colors';
import ErrorModal from '../components/ErrorModal';
import NigeriaData from '../assets/nigeria.json';

const { width } = Dimensions.get('window');
const isWeb = width > 768;

export default function EmployerProfileSetup({ navigation }) {
  const { user, refreshUser } = useAuth();
  
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [logoUri, setLogoUri] = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const [countriesList, setCountriesList] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [citiesList, setCitiesList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  const [countryModalVisible, setCountryModalVisible] = useState(false);
  const [stateModalVisible, setStateModalVisible] = useState(false);
  const [cityModalVisible, setCityModalVisible] = useState(false);

  const [countrySearch, setCountrySearch] = useState('');
  const [stateSearch, setStateSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');

  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [errorTitle, setErrorTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successVisible, setSuccessVisible] = useState(false);

  React.useEffect(() => {
    const countries = Country.getAllCountries();
    setCountriesList(countries);
  }, []);

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    setStatesList([]);
    setCitiesList([]);
    setCountryModalVisible(false);
    setCountrySearch('');

    if (country.isoCode === 'NG') {
      const states = NigeriaData.states.map(state => ({
        name: state.name,
        isoCode: state.name,
        countryCode: 'NG',
        lgas: state.lgas
      }));
      setStatesList(states);
    } else {
      const states = State.getStatesOfCountry(country.isoCode);
      setStatesList(states);
    }
  };

  const handleStateSelect = (state) => {
    setSelectedState(state);
    setSelectedCity(null);
    setCitiesList([]);
    setStateModalVisible(false);
    setStateSearch('');

    if (selectedCountry?.isoCode === 'NG') {
      const stateData = NigeriaData.states.find(s => s.name === state.name);
      if (stateData) {
        const lgas = stateData.lgas.map(lga => ({
          name: lga,
          isoCode: lga,
          stateCode: state.name,
          countryCode: 'NG'
        }));
        setCitiesList(lgas);
      }
    } else {
      const cities = City.getCitiesOfState(selectedCountry.isoCode, state.isoCode);
      setCitiesList(cities);
    }
  };

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setCityModalVisible(false);
    setCitySearch('');
  };

  const pickLogo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setLogoUri(result.assets[0].uri);
      }
    } catch (error) {
      showErrorModal('Upload Error', 'Failed to select logo.');
    }
  };

  const uploadLogo = async () => {
    if (!logoUri) return null;

    setLogoUploading(true);
    try {
      console.log('📤 Uploading logo:', logoUri);
      const logoURL = await uploadAPI.uploadImage(logoUri, 'logo.jpg', 'image/jpeg');
      console.log('✅ Logo uploaded successfully:', logoURL);
      return logoURL;
    } catch (error) {
      console.error('❌ Logo upload error:', error);
      throw error;
    } finally {
      setLogoUploading(false);
    }
  };

  const showErrorModal = (title, message) => {
    setErrorTitle(title);
    setErrorMessage(message);
    setErrorVisible(true);
  };

  // ✅ ONLY CHANGE: Enhanced error logging to see EXACT backend error
  const handleSaveProfile = async () => {
    if (!companyName || !industry || !selectedCountry || !selectedState || !selectedCity) {
      showErrorModal('Missing Fields', 'Please fill in all required fields including City/LGA');
      return;
    }

    setLoading(true);

    try {
      let logoURL = user?.logoURL || null;

      if (logoUri) {
        try {
          logoURL = await uploadLogo();
          console.log('✅ Logo uploaded:', logoURL);
        } catch (uploadError) {
          console.error('Logo upload failed:', uploadError);
          // Continue without logo if upload fails
        }
      }

      const updateData = {
        companyName: companyName.trim(),
        industry: industry.trim(),
        country: selectedCountry.name,
        state: selectedState.name,
        city: selectedCity.name,
        profileComplete: true,
      };

      if (logoURL) {
        updateData.logoURL = logoURL;
      }

      console.log('💾 Sending to backend:', JSON.stringify(updateData, null, 2));
      console.log('📍 User ID:', user.id);

      // ✅ NEW: Catch and log the ACTUAL backend response
      try {
        const response = await profileAPI.updateProfile(user.id, updateData);
        console.log('✅ SUCCESS - Backend response:', JSON.stringify(response, null, 2));
        
        await refreshUser();
        setSuccessVisible(true);
      } catch (apiError) {
        // ✅ NEW: Log the exact error from backend
        console.error('❌ BACKEND ERROR - Full object:', apiError);
        console.error('❌ BACKEND ERROR - Message:', apiError.message);
        console.error('❌ BACKEND ERROR - Name:', apiError.name);
        
        // Try to extract more details
        if (apiError.response) {
          console.error('❌ BACKEND ERROR - Response status:', apiError.response.status);
          console.error('❌ BACKEND ERROR - Response data:', apiError.response.data);
        }
        
        throw apiError; // Re-throw to be caught by outer catch
      }
    } catch (error) {
      console.error('❌ OUTER ERROR:', error);
      showErrorModal('Update Failed', error.message || 'Failed to update profile. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const SearchableModal = ({ visible, onClose, title, data, onSelect, searchValue, onSearchChange, emptyMessage }) => {
    const filteredData = data.filter(item =>
      item.name.toLowerCase().includes(searchValue.toLowerCase())
    );

    return (
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder={`Search ${title.toLowerCase()}...`}
                placeholderTextColor={Colors.textMuted}
                value={searchValue}
                onChangeText={onSearchChange}
                autoFocus
              />
            </View>

            {filteredData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{emptyMessage || 'No results found'}</Text>
              </View>
            ) : (
              <FlatList
                data={filteredData}
                keyExtractor={(item, index) => item.isoCode || item.name + index}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => onSelect(item)}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      <ErrorModal
        visible={errorVisible}
        title={errorTitle}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
      />
      
      <ErrorModal
        visible={successVisible}
        title="Success!"
        message="Company profile updated successfully!"
        onClose={() => {
          setSuccessVisible(false);
          navigation.goBack();
        }}
      />

      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Company Setup</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={isWeb ? true : false}
      >
        <View style={[styles.contentWrapper, isWeb && styles.contentWrapperWeb]}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Company Information</Text>
            <Text style={styles.cardDescription}>
              Help candidates find your company by completing your profile
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Company Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., TechCorp Ltd, HealthPlus Clinics"
                placeholderTextColor={Colors.textMuted}
                value={companyName}
                onChangeText={setCompanyName}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Industry *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Technology, Healthcare, Finance"
                placeholderTextColor={Colors.textMuted}
                value={industry}
                onChangeText={setIndustry}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Upload Company Logo (Optional)</Text>
              <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickLogo}
                disabled={loading || logoUploading}
              >
                <Text style={styles.uploadButtonText}>
                  {logoUri ? '✓ Logo Selected' : '📸 Choose Logo (Square Image)'}
                </Text>
              </TouchableOpacity>
              {logoUri && (
                <Text style={styles.hint}>Image ready to upload</Text>
              )}
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionTitle}>Location</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Country *</Text>
              <TouchableOpacity
                style={styles.selectInput}
                onPress={() => setCountryModalVisible(true)}
                disabled={loading}
              >
                <Text style={selectedCountry ? styles.selectText : styles.selectPlaceholder}>
                  {selectedCountry?.name || 'Search Country'}
                </Text>
                <Text style={styles.searchIconButton}>🔍</Text>
              </TouchableOpacity>
            </View>

            {selectedCountry && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>State/Province *</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setStateModalVisible(true)}
                  disabled={loadingStates || loading}
                >
                  <Text style={selectedState ? styles.selectText : styles.selectPlaceholder}>
                    {loadingStates ? 'Loading states...' : (selectedState?.name || 'Search State')}
                  </Text>
                  {loadingStates ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={styles.searchIconButton}>🔍</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {selectedState && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>City/LGA *</Text>
                <TouchableOpacity
                  style={styles.selectInput}
                  onPress={() => setCityModalVisible(true)}
                  disabled={loadingCities || loading}
                >
                  <Text style={selectedCity ? styles.selectText : styles.selectPlaceholder}>
                    {loadingCities ? 'Loading cities...' : (selectedCity?.name || 'Search City/LGA')}
                  </Text>
                  {loadingCities ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <Text style={styles.searchIconButton}>🔍</Text>
                  )}
                </TouchableOpacity>
                {!loadingCities && citiesList.length > 0 && (
                  <Text style={styles.hint}>{citiesList.length} cities available</Text>
                )}
              </View>
            )}

            <TouchableOpacity
              style={[styles.saveButton, (loading || logoUploading) && styles.buttonDisabled]}
              onPress={handleSaveProfile}
              disabled={loading || logoUploading}
              activeOpacity={0.8}
            >
              {(loading || logoUploading) ? (
                <View style={styles.buttonContent}>
                  <ActivityIndicator color={Colors.white} size="small" />
                  <Text style={[styles.saveButtonText, { marginLeft: 10 }]}>
                    {logoUploading ? 'Uploading Logo...' : 'Saving...'}
                  </Text>
                </View>
              ) : (
                <Text style={styles.saveButtonText}>Save Company Profile</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.requiredNote}>* Required fields</Text>
          </View>
        </View>
      </ScrollView>

      <SearchableModal
        visible={countryModalVisible}
        onClose={() => {
          setCountryModalVisible(false);
          setCountrySearch('');
        }}
        title="Country"
        data={countriesList}
        onSelect={handleCountrySelect}
        searchValue={countrySearch}
        onSearchChange={setCountrySearch}
        emptyMessage="No countries found"
      />

      <SearchableModal
        visible={stateModalVisible}
        onClose={() => {
          setStateModalVisible(false);
          setStateSearch('');
        }}
        title="State/Province"
        data={statesList}
        onSelect={handleStateSelect}
        searchValue={stateSearch}
        onSearchChange={setStateSearch}
        emptyMessage="No states found"
      />
      <SearchableModal
        visible={cityModalVisible}
        onClose={() => {
          setCityModalVisible(false);
          setCitySearch('');
        }}
        title="City/LGA"
        data={citiesList}
        onSelect={handleCitySelect}
        searchValue={citySearch}
        onSearchChange={setCitySearch}
        emptyMessage="No cities found"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
    ...(isWeb && { height: '100vh' }),
  },
  header: {
    backgroundColor: Colors.white,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGray,
  },
  headerContent: {
    paddingHorizontal: isWeb ? 40 : 24,
    maxWidth: isWeb ? 1200 : '100%',
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  backText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
    ...(isWeb && { height: 'calc(100vh - 100px)' }),
  },
  content: {
    paddingVertical: 32,
    paddingBottom: 60,
  },
  contentWrapper: {
    paddingHorizontal: 24,
  },
  contentWrapperWeb: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 40,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  cardDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 32,
    fontWeight: '500',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 24,
    letterSpacing: -0.3,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
    fontWeight: '400',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 16,
  },
  hint: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 8,
    fontWeight: '500',
  },
  uploadButton: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.mediumGray,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  selectInput: {
    backgroundColor: Colors.lightGray,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 15,
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  selectPlaceholder: {
    fontSize: 15,
    color: Colors.textMuted,
  },
  searchIconButton: {
    fontSize: 18,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.mediumGray,
    marginVertical: 32,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  requiredNote: {
    fontSize: 13,
    color: Colors.textMuted,
    marginTop: 20,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.mediumGray,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 24,
    color: Colors.textSecondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.lightGray,
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.mediumGray,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  modalItemText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
});