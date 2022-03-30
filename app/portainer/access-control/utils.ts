import { TeamId } from '../teams/types';
import { UserId } from '../users/types';

import {
  AccessControlFormData,
  OwnershipParameters,
  ResourceControlOwnership,
  ResourceId,
} from './types';
import { ResourceControlViewModel } from './models/ResourceControlViewModel';

/**
 * Transform AccessControlFormData to ResourceControlOwnershipParameters
 * @param {int} userId ID of user performing the operation
 * @param {AccessControlFormData} formValues Form data (generated by AccessControlForm)
 * @param {int[]} subResources Sub Resources restricted by the ResourceControl
 */
export function parseOwnershipParameters(
  formValues: AccessControlFormData,
  subResourcesIds: ResourceId[] = []
): OwnershipParameters {
  const { ownership, authorizedTeams, authorizedUsers } = formValues;

  const adminOnly = ownership === ResourceControlOwnership.ADMINISTRATORS;
  const publicOnly = ownership === ResourceControlOwnership.PUBLIC;

  let users = authorizedUsers;
  let teams = authorizedTeams;
  if (
    [
      ResourceControlOwnership.ADMINISTRATORS,
      ResourceControlOwnership.PUBLIC,
    ].includes(ownership)
  ) {
    users = [];
    teams = [];
  }

  return {
    administratorsOnly: adminOnly,
    public: publicOnly,
    users,
    teams,
    subResourcesIds,
  };
}

export function parseAccessControlFormData(
  isAdmin: boolean,
  resourceControl?: ResourceControlViewModel
): AccessControlFormData {
  let ownership =
    resourceControl?.Ownership || ResourceControlOwnership.PRIVATE;
  if (isAdmin) {
    if (!resourceControl) {
      ownership = ResourceControlOwnership.ADMINISTRATORS;
    } else if (ownership === ResourceControlOwnership.PRIVATE) {
      ownership = ResourceControlOwnership.RESTRICTED;
    }
  }

  let authorizedTeams: TeamId[] = [];
  let authorizedUsers: UserId[] = [];
  if (
    resourceControl &&
    [
      ResourceControlOwnership.PRIVATE,
      ResourceControlOwnership.RESTRICTED,
    ].includes(ownership)
  ) {
    authorizedTeams = resourceControl.TeamAccesses.map((ra) => ra.TeamId);
    authorizedUsers = resourceControl.UserAccesses.map((ra) => ra.UserId);
  }

  return { ownership, authorizedUsers, authorizedTeams };
}