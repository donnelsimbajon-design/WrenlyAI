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

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Style Maps ───────────────────────────────────────────────────────────────

const containerVariant: Record<ButtonVariant, string> = {
  primary: 'bg-wrenly-primary active:bg-navy-900',
  outline: 'border border-wrenly-primary bg-transparent active:bg-navy-50',
  ghost: 'bg-transparent active:opacity-60',
};

const textVariant: Record<ButtonVariant, string> = {
  primary: 'text-white',
  outline: 'text-wrenly-primary',
  ghost: 'text-wrenly-primary',
};

const containerSize: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 rounded-lg',
  md: 'px-6 py-3.5 rounded-xl',
  lg: 'px-8 py-4 rounded-2xl',
};

const textSize: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Reusable primary Button component for Wrenly AI.
 * Follows the shadcn aesthetic — clean, flat, accessible.
 */
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

  return (
    <TouchableOpacity
      accessible
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={`
        flex-row items-center justify-center
        ${containerVariant[variant]}
        ${containerSize[size]}
        ${isDisabled ? 'opacity-50' : 'opacity-100'}
      `}
      style={style}
      activeOpacity={0.8}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : '#1E3A8A'}
          className="mr-2"
        />
      ) : null}
      <Text
        className={`
          font-semibold tracking-wide
          ${textVariant[variant]}
          ${textSize[size]}
        `}
      >
        {label}
      </Text>
      {rightIcon && !loading && (
        <View className="ml-2">
          {rightIcon}
        </View>
      )}
    </TouchableOpacity>
  );
}
