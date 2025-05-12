import type { ResolvedConfig } from "../config";

const pairStorageKey = "_optable_pairId";

type StorageKeys = { write: string[]; read: string[] };

export function encodeBase64(str: string): string {
  const codeUnits = new Uint16Array(str.length);
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = str.charCodeAt(i);
  }
  return btoa(String.fromCharCode(...new Uint8Array(codeUnits.buffer)));
}

function getWriteKeyBase64FromConfig(config: ResolvedConfig): string {
  if (config.node) {
    return encodeBase64(`${config.host}/${config.node}`);
  }

  return encodeBase64(`${config.host}`);
}

// Generate the keys for the site storage
// The keys are generated based on the host and node configs
function generateSiteKeys(config: ResolvedConfig): StorageKeys {
  const key = `OPTABLE_SITE_${getWriteKeyBase64FromConfig(config)}`;

  return { write: [key], read: [key] };
}

// Generate the keys for the targeting storage
// The keys are generated based on the host and node configs
function generateTargetingKeys(config: ResolvedConfig): StorageKeys {
  const privateKey = `OPTABLE_TARGETING_${getWriteKeyBase64FromConfig(config)}`;
  const publicKey = config.optableCacheTargeting;

  return { write: [privateKey, publicKey], read: [privateKey] };
}

function generatedPairKeys(): StorageKeys {
  return { write: [pairStorageKey], read: [pairStorageKey] };
}

// Generate the keys for the passport storage
// The keys are generated based on the host and node configs
// We need to keep backward compatibility with the legacy host cache
// We support keeping cache when moving from host only to host/node
// We do not support keeping cache when moving from host/node to host only
function generatePassportKeys(config: ResolvedConfig): StorageKeys {
  const write: string[] = [];
  const read: string[] = [];

  const writeKey = `OPTABLE_PASSPORT_${getWriteKeyBase64FromConfig(config)}`;

  write.push(writeKey);

  // We keep `OPTABLE_PASS` keys for backward compatibility
  // Once all clients are updated, we can remove them on next tag
  if (config.legacyHostCache) {
    read.push(`OPTABLE_PASSPORT_${encodeBase64(`${config.legacyHostCache}`)}`);
    read.push(`OPTABLE_PASS_${encodeBase64(`${config.legacyHostCache}/${config.site}`)}`);
  } else {
    read.push(`OPTABLE_PASS_${encodeBase64(`${config.host}/${config.site}`)}`);
  }

  read.push(writeKey);
  return { write, read };
}

export type { StorageKeys };
export { generateSiteKeys, generatedPairKeys, generatePassportKeys, generateTargetingKeys };
