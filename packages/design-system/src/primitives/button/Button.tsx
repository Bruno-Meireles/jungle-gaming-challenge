export type ButtonProps = React.ComponentProps<'button'> & {
  variant?: 'primary' | 'outline' | 'ghost' | 'icon';
  size?: 'md' | 'lg' | 'block';
  asChild?: boolean;
  loading?: boolean;
};

export function Button(props: ButtonProps) {
  void props;
  return null;
}
