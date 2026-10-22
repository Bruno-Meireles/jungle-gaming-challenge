export type RangeSliderProps = {
  value: [number, number];
  min: number;
  max: number;
  step: number;
  onValueChange: (value: [number, number]) => void;
  thumbLabels: [string, string];
};

export function RangeSlider(props: RangeSliderProps) {
  void props;
  return null;
}
