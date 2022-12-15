// Based on https://github.com/InteractiveAdvertisingBureau/openrtb/blob/master/extensions/2.x_official_extensions/eids.md
type UserSegment = {
  id?: string
  name?: string
  value?: string
  ext?: any
};

type UserData = {
  id?: string
  name?: string
  segment?: UserSegment[]
  ext?: { segtax: number }
};

type ExtendedIdentifierUID = {
  id: string
  atype: UIDAgentType;
  ext?: any;
}

type ExtendedIdentifiers = {
  source: string;
  uids: ExtendedIdentifierUID[];
}


type UserExt = {
  eids?: ExtendedIdentifiers[];
}

type User = {
  data?: UserData[]
  ext?: UserExt
}

enum UIDAgentType {
  DeviceID = 1,
  InAppImpression = 2,
  PersonID = 3,
}

export { User, UIDAgentType }
