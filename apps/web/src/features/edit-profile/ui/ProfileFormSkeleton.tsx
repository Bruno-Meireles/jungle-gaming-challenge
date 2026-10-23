import { Skeleton } from '@jg/design-system';

const FIELDS = ['displayName', 'username', 'email', 'currentPassword', 'newPassword', 'confirmPassword'] as const;

export function ProfileFormSkeleton() {
  return (
    <div data-testid="profile-form-skeleton" aria-busy="true" className="flex flex-col gap-24">
      <Skeleton className="size-50 rounded-25" />
      <div className="grid grid-cols-1 gap-x-28 gap-y-24 tablet:grid-cols-[repeat(2,minmax(0,417px))]">
        {FIELDS.map((field) => (
          <Skeleton key={field} className="h-40 rounded-3" />
        ))}
      </div>
      <Skeleton className="h-40 w-131 rounded-3" />
    </div>
  );
}
