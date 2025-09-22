import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#000',
    minWidth: '70%',
  },
  inputError: {
    borderColor: '#ff4d4d', // red border for error
  },
  errorText: {
    color: '#ff4d4d',
    fontSize: 12,
    marginTop: 4,
  },
  label: {
    marginBottom: 4,
    fontSize: 14,
    color: '#555',
  },
});
