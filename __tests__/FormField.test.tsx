import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import FormField from '../src/components/FormField';

describe('FormField', () => {
  it('renders the label correctly', () => {
    const { UNSAFE_queryAllByType } = render(
      <FormField label="Habit Title" placeholder="e.g. Drink Water" value="" onChangeText={jest.fn()} />
    );
    const texts = UNSAFE_queryAllByType('text');
    const found = texts.some((t) => {
      const child = t.props.children;
      return child === 'Habit Title' || (Array.isArray(child) && child.includes('Habit Title'));
    });
    expect(found).toBe(true);
  });

  it('renders the placeholder correctly', () => {
    const { UNSAFE_queryAllByType } = render(
      <FormField label="Habit Title" placeholder="e.g. Drink Water" value="" onChangeText={jest.fn()} />
    );
    const inputs = UNSAFE_queryAllByType('input');
    const found = inputs.some((i) => i.props.placeholder === 'e.g. Drink Water');
    expect(found).toBe(true);
  });

  it('displays the current value', () => {
    const { UNSAFE_queryAllByType } = render(
      <FormField label="Habit Title" placeholder="e.g. Drink Water" value="Morning Run" onChangeText={jest.fn()} />
    );
    const inputs = UNSAFE_queryAllByType('input');
    const found = inputs.some((i) => i.props.value === 'Morning Run');
    expect(found).toBe(true);
  });

  it('fires onChangeText when the user types', () => {
    const mockOnChange = jest.fn();
    const { UNSAFE_queryAllByType } = render(
      <FormField label="Habit Title" placeholder="e.g. Drink Water" value="" onChangeText={mockOnChange} />
    );
    const inputs = UNSAFE_queryAllByType('input');
    const input = inputs.find((i) => i.props.placeholder === 'e.g. Drink Water');
    expect(input).toBeTruthy();
    fireEvent(input, 'changeText', 'Drink Water');
    expect(mockOnChange).toHaveBeenCalledWith('Drink Water');
  });

  it('fires onChangeText with each new value as the user types', () => {
    const mockOnChange = jest.fn();
    const { UNSAFE_queryAllByType } = render(
      <FormField label="Notes" placeholder="Optional notes" value="" onChangeText={mockOnChange} />
    );
    const inputs = UNSAFE_queryAllByType('input');
    const input = inputs.find((i) => i.props.placeholder === 'Optional notes');
    expect(input).toBeTruthy();
    fireEvent(input, 'changeText', 'First');
    fireEvent(input, 'changeText', 'First change');
    expect(mockOnChange).toHaveBeenCalledTimes(2);
    expect(mockOnChange).toHaveBeenNthCalledWith(1, 'First');
    expect(mockOnChange).toHaveBeenNthCalledWith(2, 'First change');
  });

  it('renders with a numeric keyboard type without crashing', () => {
    const { UNSAFE_queryAllByType } = render(
      <FormField label="Value" placeholder="e.g. 8" value="" onChangeText={jest.fn()} keyboardType="numeric" />
    );
    const inputs = UNSAFE_queryAllByType('input');
    const found = inputs.some((i) => i.props.placeholder === 'e.g. 8');
    expect(found).toBe(true);
  });
});
