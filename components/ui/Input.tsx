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

  return (
    <View className="mb-5">
      <Text className="text-wrenly-text text-[11px] font-bold tracking-widest uppercase mb-2 ml-1">
        {label}
      </Text>
      
      <View
        className={`flex-row items-center bg-wrenly-surface rounded-xl border ${
          error
            ? 'border-wrenly-danger'
            : isFocused
            ? 'border-wrenly-primary'
            : 'border-wrenly-border'
        } px-4 py-3.5`}
      >
        {leftIcon && (
          <View className="mr-3">
            {leftIcon}
          </View>
        )}

        <TextInput
          className="flex-1 text-wrenly-text text-base"
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
          style={[{ outlineStyle: 'none' } as any, style]} // Fix for web focus ring
          {...props}
        />
        
        {isPassword && (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setShowPassword(!showPassword)}
            className="ml-2"
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
        <Text className="text-wrenly-danger text-xs mt-1.5 ml-1 font-medium">
          {error}
        </Text>
      )}
    </View>
  );
}
