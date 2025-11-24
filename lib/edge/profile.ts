import type { ResolvedConfig } from "../config";
import { fetch } from "../core/network";

type ProfileTraits = {
  [key: string]: string | number | boolean;
};

function Profile(config: ResolvedConfig, traits: ProfileTraits, id: string | null = null, neighbors: string[] | null = null): Promise<void> {
  const profile: {
    traits: ProfileTraits;
    id?: string;
    neighbors?: string[];
  } = {
    traits: traits,
    ...(id && { id: id }),
    ...(neighbors && { neighbors: neighbors }),
  };

  return fetch("/profile", config, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });
}

export { Profile, ProfileTraits };
export default Profile;
