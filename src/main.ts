import * as core from '@actions/core'
import { Logger } from './lib'
import git from './git'
import { getVersionFromGit, stringify, withPullRequestInfo } from './version'
import { PullRequestEvent } from './github'

async function run(): Promise<void> {
    try {
        //    const { stdout: commitsSinceLastVersionTag } = await invoke('echo $(git describe --match "v*" | cut -d "-" -s -f 2)', [])
        //    const { stdout: versionTag } = await invoke('echo $(git describe --abbrev=0 --tags --match "v*" | cut -c 2-)', [])

        const eventName = core.getInput('eventName', { required: true })
        const eventAsJson = core.getInput('event', { required: false })

        const logger: Logger = {
            debug: core.debug,
            info: core.info,
            warning: core.warning,
            error: core.error
        }

        let version = await getVersionFromGit(git, logger)

        if (eventName === 'pull_request' && eventAsJson != null) {
            const event = JSON.parse(eventAsJson) as PullRequestEvent
            version = withPullRequestInfo(version, event)
        }

        const { major, minor, patch, preRelease, buildMetadata } = version

        core.info(`Calculated version: ${stringify(version, true)}`)
        core.info(`major: ${major}`)
        core.info(`minor: ${minor}`)
        core.info(`patch: ${patch}`)
        if (preRelease) core.info(`pre-release: ${preRelease}`)
        if (buildMetadata) core.info(`build metadata: ${buildMetadata}`)

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
