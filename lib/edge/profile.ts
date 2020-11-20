import type { OptableConfig } from "../config";
import { fetch } from "../core/network";

type ProfileTraits = {
  [key: string]: string | number | boolean;
};

function Profile(config: OptableConfig, traits: ProfileTraits): Promise<void> {
  const profile = {
    traits: traits,
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
