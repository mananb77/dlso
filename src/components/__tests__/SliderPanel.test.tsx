import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SliderPanel } from '../SliderPanel';

describe('SliderPanel', () => {
  const defaultProps = {
    values: { effort: 8, sleep: 9, leisure: 7 },
    optimals: { effort: 8.7, sleep: 9.1, leisure: 4.3 },
    onChange: vi.fn(),
    onReset: vi.fn(),
  };

  it('renders three sliders', () => {
    render(<SliderPanel {...defaultProps} />);
    const sliders = screen.getAllByRole('slider');
    expect(sliders).toHaveLength(3);
  });

  it('slider change calls onChange with correct activity', () => {
    const onChange = vi.fn();
    render(<SliderPanel {...defaultProps} onChange={onChange} />);

    const sliders = screen.getAllByRole('slider');
    fireEvent.change(sliders[0], { target: { value: '10' } });

    expect(onChange).toHaveBeenCalledWith('effort', 10);
  });

  it('displays current values', () => {
    render(<SliderPanel {...defaultProps} />);
    expect(screen.getByText('8.0h')).toBeInTheDocument();
    expect(screen.getByText('9.0h')).toBeInTheDocument();
    expect(screen.getByText('7.0h')).toBeInTheDocument();
  });

  it('reset button calls onReset', () => {
    const onReset = vi.fn();
    render(<SliderPanel {...defaultProps} onReset={onReset} />);
    fireEvent.click(screen.getByText('Reset to Optimal'));
    expect(onReset).toHaveBeenCalled();
  });
});
