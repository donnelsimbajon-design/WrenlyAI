import React, { useState } from 'react';
import { TextInput, View, Text, TouchableOpacity, TextInputProps } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '@/config/theme';

export interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
}

export function Input({ label, error, isPassword, leftIcon, style, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const borderColor = error
    ? theme.colors.wrenly.danger
    : isFocused
    ? theme.colors.wrenly.primary
    : theme.colors.wrenly.border;

  return (
    <View style={{ marginBottom: 18 }}>
      <Text style={{
        fontSize: 11,
        fontWeight: 'bold',
        letterSpacing: 1,
        textTransform: 'uppercase',
        color: theme.colors.wrenly.textSecondary,
        marginBottom: 8,
        marginLeft: 2,
      }}>
        {label}
      </Text>

      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor,
        paddingHorizontal: 14,
        paddingVertical: 12,
      }}>
        {leftIcon && (
          <View style={{ marginRight: 10 }}>
            {leftIcon}
          </View>
        )}

        <TextInput
          style={[{
            flex: 1,
            fontSize: 15,
            color: theme.colors.wrenly.text,
            outlineStyle: 'none', // web fix
          } as any, style]}
          placeholderTextColor={theme.colors.wrenly.textSecondary}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          secureTextEntry={isPassword && !showPassword}
          {...props}
        />

        {isPassword && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPassword(!showPassword)}
            style={{ marginLeft: 8 }}
          >
            <MaterialCommunityIcons
              name={showPassword ? 'eye-off' : 'eye'}
              size={20}
              color={theme.colors.wrenly.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Text style={{
          color: theme.colors.wrenly.danger,
          fontSize: 12,
          marginTop: 6,
          marginLeft: 2,
          fontWeight: '500',
        }}>
          {error}
        </Text>
      )}
    </View>
  );
}
