import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
  type StyleProp,
  type TouchableOpacityProps,
  type ViewStyle,
} from 'react-native';
import { theme } from '@/config/theme';

type ButtonVariant = 'primary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  rightIcon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const sizeStyles: Record<ButtonSize, { paddingHorizontal: number; paddingVertical: number; borderRadius: number }> = {
  sm: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  md: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 14 },
  lg: { paddingHorizontal: 28, paddingVertical: 16, borderRadius: 18 },
};

const textSizes: Record<ButtonSize, number> = {
  sm: 13,
  md: 15,
  lg: 17,
};

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  rightIcon,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  const containerStyle: ViewStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...sizeStyles[size],
    opacity: isDisabled ? 0.5 : 1,
    ...(variant === 'primary' && { backgroundColor: theme.colors.wrenly.primary }),
    ...(variant === 'outline' && {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.colors.wrenly.primary,
    }),
    ...(variant === 'ghost' && { backgroundColor: 'transparent' }),
  };

  const textColor =
    variant === 'primary' ? '#FFFFFF' : theme.colors.wrenly.primary;

  return (
    <TouchableOpacity
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      style={[containerStyle, style]}
      activeOpacity={0.8}
      {...rest}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : theme.colors.wrenly.primary}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={{
        fontWeight: '700',
        letterSpacing: 0.3,
        fontSize: textSizes[size],
        color: textColor,
      }}>
        {label}
      </Text>
      {rightIcon && !loading && (
        <View style={{ marginLeft: 8 }}>
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
}
