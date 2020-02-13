import {Git} from './git'

const dashRegex = /-/
const dotRegex = /\./

interface SemanticVersion {
  major: string
  minor: string
  patch: string
  preRelease?: string
  buildMetadata?: string
}

export async function getVersionFromGit(git: Git): Promise<SemanticVersion> {
  const described = await git.describe('v*')
  const [majorMinor, commitsSinceTag, sha1] = described.split(dashRegex)
  const [major, minor] = majorMinor.substring(1).split(dotRegex)

  return {
    major,
    minor,
    patch: commitsSinceTag ?? '',
    preRelease: '',
    buildMetadata: sha1 ?? ''
  }
}

export function stringify(
  v: SemanticVersion,
  includeMetadata: boolean
): string {
  let res = `${v.major}.${v.minor}.${v.patch}`
  if (v.preRelease != null) res += `-${v.preRelease}`
  if (includeMetadata && v.buildMetadata != null) res += `+${v.buildMetadata}`
  return res
}
