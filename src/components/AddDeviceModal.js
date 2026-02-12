import { useState } from 'react';
import {
	ActivityIndicator,
	Alert,
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { claimDevice } from '../services/DeviceService';

const AddDeviceModal = ({ visible, onClose, onSuccess }) => {
	const [deviceId, setDeviceId] = useState('');
	const [nickname, setNickname] = useState('');
	const [loading, setLoading] = useState(false);

	const handleClaim = async () => {
		if (!deviceId.trim()) {
			Alert.alert('Error', 'Please enter a Device ID.');
			return;
		}

		setLoading(true);
		try {
			await claimDevice(deviceId, nickname);
			Alert.alert('Success', 'Device added successfully!');
			setDeviceId('');
			setNickname('');
			onSuccess(); // Refresh parent
		} catch (error) {
			Alert.alert('Failed to Add Device', error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Modal
			animationType="slide"
			transparent={true}
			visible={visible}
			onRequestClose={onClose}
		>
			<View style={styles.centeredView}>
				<View style={styles.modalView}>
					<View style={styles.header}>
						<Text style={styles.modalTitle}>Add New Device</Text>
						<TouchableOpacity onPress={onClose}>
							<MaterialCommunityIcons
								name="close"
								size={24}
								color="#64748B"
							/>
						</TouchableOpacity>
					</View>

					<Text style={styles.label}>Device ID (MAC Address)</Text>
					<View style={styles.inputContainer}>
						<MaterialCommunityIcons
							name="barcode-scan"
							size={20}
							color="#94A3B8"
						/>
						<TextInput
							style={styles.input}
							placeholder="e.g. 24:0A:C4..."
							placeholderTextColor="#CBD5E1"
							value={deviceId}
							onChangeText={setDeviceId}
							autoCapitalize="characters"
						/>
					</View>
					<Text style={styles.helperText}>
						Find this on the sticker of your device.
					</Text>

					<Text style={[styles.label, { marginTop: 16 }]}>
						Device Nickname
					</Text>
					<View style={styles.inputContainer}>
						<MaterialCommunityIcons
							name="tag-outline"
							size={20}
							color="#94A3B8"
						/>
						<TextInput
							style={styles.input}
							placeholder="e.g. Kitchen Sink"
							placeholderTextColor="#CBD5E1"
							value={nickname}
							onChangeText={setNickname}
						/>
					</View>

					<TouchableOpacity
						style={[styles.button, loading && { opacity: 0.7 }]}
						onPress={handleClaim}
						disabled={loading}
					>
						{loading ? (
							<ActivityIndicator color="#FFF" />
						) : (
							<Text style={styles.buttonText}>Link Device</Text>
						)}
					</TouchableOpacity>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(0,0,0,0.5)',
	},
	modalView: {
		width: '90%',
		backgroundColor: 'white',
		borderRadius: 20,
		padding: 24,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 24,
	},
	modalTitle: {
		fontSize: 20,
		fontWeight: 'bold',
		color: '#1E293B',
	},
	label: {
		fontSize: 14,
		fontWeight: '600',
		color: '#475569',
		marginBottom: 8,
	},
	inputContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderColor: '#E2E8F0',
		borderRadius: 12,
		paddingHorizontal: 12,
		backgroundColor: '#F8FAFC',
		height: 48,
	},
	input: {
		flex: 1,
		marginLeft: 8,
		fontSize: 16,
		color: '#1E293B',
	},
	helperText: {
		fontSize: 12,
		color: '#94A3B8',
		marginTop: 4,
	},
	button: {
		backgroundColor: '#007AFF',
		borderRadius: 12,
		padding: 16,
		alignItems: 'center',
		marginTop: 24,
	},
	buttonText: {
		color: 'white',
		fontWeight: 'bold',
		fontSize: 16,
	},
});

export default AddDeviceModal;
