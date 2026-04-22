import { Text, TextInput, View, TextInputProps } from 'react-native';
import { g, lightColors, darkColors } from '../styles/GlobalStyles';
import { useTheme } from '../context/ThemeContext';

type Props = TextInputProps & {
  label: string;
};

export default function FormField({ label, ...props }: Props) {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  return (
    <View>
      <Text style={[g.label, { color: colors.black }]}>{label}</Text>
      <TextInput
        style={[
          g.input,
          {
            color: colors.black,
            backgroundColor: colors.white,
            borderColor: colors.border,
          },
        ]}
        placeholderTextColor={theme === 'dark' ? '#9ca3af' : '#999'}
        accessibilityLabel={label}
        accessibilityHint={props.placeholder}
        {...props}
      />
    </View>
  );
}