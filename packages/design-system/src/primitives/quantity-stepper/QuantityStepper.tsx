export type QuantityStepperProps = {
  value: number;
  min: number;
  max: number;
  onValueChange: (value: number) => void;
  label: string;
  decrementLabel?: string;
  incrementLabel?: string;
};

export function QuantityStepper(props: QuantityStepperProps) {
  void props;
  return null;
}
