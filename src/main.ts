import * as core from '@actions/core'
import { Logger } from './lib'
import git from './git'
import { getVersionFromGit, stringify } from './version'

async function run(): Promise<void> {
    try {
        //    const { stdout: commitsSinceLastVersionTag } = await invoke('echo $(git describe --match "v*" | cut -d "-" -s -f 2)', [])
        //    const { stdout: versionTag } = await invoke('echo $(git describe --abbrev=0 --tags --match "v*" | cut -c 2-)', [])

        const logger: Logger = {
            debug: core.debug,
            info: core.info,
            warning: core.warning,
            error: core.error,
        }

        const version = await getVersionFromGit(git, logger)
        const { major, minor, patch, preRelease, buildMetadata } = version

        core.info(`Calculated version: ${stringify(version, true)}`)
        core.info(`major: ${major}`)
        core.info(`minor: ${minor}`)
        core.info(`patch: ${patch}`)

        core.setOutput('full', stringify(version, true))
        core.setOutput('fullNoMeta', stringify(version, false))
        core.setOutput('major', major)
        core.setOutput('minor', minor)
        core.setOutput('patch', patch)

        if (preRelease) core.setOutput('preRelease', preRelease)
        if (buildMetadata) core.setOutput('buildMetadata', buildMetadata)
    } catch (error) {
        core.setFailed(error.message)
    }
}

run()
