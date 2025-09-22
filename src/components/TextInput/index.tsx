import React from 'react';
import { TextInput, View, Text } from 'react-native';
import { styles } from './style';

type PriTextInputProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  label?: string;
  secureTextEntry?: boolean;
  error?: string; // error message
  style?: any; // extra style override
};

export const Pri_TextInput = ({
  value,
  onChangeText,
  placeholder,
  label,
  secureTextEntry = false,
  error,
  style,
}: PriTextInputProps) => {
  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        style={[styles.input, error ? styles.inputError : null, style]}
        placeholderTextColor="#999"
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};
