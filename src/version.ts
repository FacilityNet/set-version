import { Logger, nullLogger } from './lib'
import { Git } from './git'
import { PullRequestEvent } from './github'

const dashRegex = /-/
const dotRegex = /\./

export interface SemanticVersion {
    major: string
    minor: string
    patch: string
    preRelease?: string
    buildMetadata?: string
}

export async function getVersionFromGit(
    git: Git,
    logger: Logger = nullLogger
): Promise<SemanticVersion> {
    // Ensure we have tags available
    await git.fetchTags(logger)

    // Find nearest tag
    const described = await git.describe('v*', logger)

    // Parse tag output
    const [majorMinor, commitsSinceTag, sha1] = described.split(dashRegex)
    const [major, minor] = majorMinor.substring(1).split(dotRegex)

    return {
        major,
        minor: minor ?? '0',
        patch: commitsSinceTag ?? '0',
        preRelease: '',
        buildMetadata: sha1 ?? ''
    }
}

export function withPullRequestInfo(
    version: SemanticVersion,
    event?: PullRequestEvent
): SemanticVersion {
    if (event == null) return version

    return {
        ...version,
        preRelease: `pr${event.number}`
    }
}

export function stringify(
    v: SemanticVersion,
    includeMetadata: boolean
): string {
    let res = `${v.major}.${v.minor}.${v.patch}`
    if (v.preRelease) res += `-${v.preRelease}`
    if (includeMetadata && v.buildMetadata) res += `+${v.buildMetadata}`
    return res
}
