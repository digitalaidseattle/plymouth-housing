import { ClientPrincipal } from '../types/interfaces';
import { USER_ROLES } from '../types/constants';

export function assertLoggedIn(userId: number | null): asserts userId is number {
  if (userId === null) throw new Error('You must be signed in to perform this action.');
}

export function getRole(user: ClientPrincipal | null): string {
  if (user?.userRoles?.includes(USER_ROLES.VOLUNTEER)) {
    return USER_ROLES.VOLUNTEER;
  }

  if (user?.userRoles?.includes(USER_ROLES.ADMIN)) {
    return USER_ROLES.ADMIN;
  }

  throw new Error(`${user?.userDetails ?? JSON.stringify(user)} - User is not a member of Admin or Volunteer role.`);
}
