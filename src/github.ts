/* eslint-disable @typescript-eslint/naming-convention -- These interfaces are controlled by GitHub, we cannot enforce naming conventions */

export enum PullRequestAction {
    Assigned = 'assigned',
    Unassigned = 'unassigned',
    Labeled = 'labeled',
    Unlabeled = 'unlabeled',
    Opened = 'opened',
    Edited = 'edited',
    Closed = 'closed',
    Reopened = 'reopened',
    Synchronize = 'synchronize',
    ReadyForReview = 'ready_for_review',
    Locked = 'locked',
    Unlocked = 'unlocked',
    ReviewRequested = 'review_requested',
    ReviewRequestRemoved = 'review_request_removed'
}

export interface User {
    id: number
    login: string
    url: string
    type: string
}

export interface Label {
    id: number
    url: string
    name: string
    description: string
    color: string
    default: boolean
}

export interface Milestone {
    id: number
    url: string
    number: number
    state: 'open' | 'closed'
    title: string
    description: string
    creator: User
    open_issues: number
    closed_issues: number
    created_at: string
    updated_at: string
    closed_at: string
    due_on: string
}

export interface Branch {
    label: string
    ref: string
    sha: string
    user: User
}

export interface PullRequest {
    id: number
    url: string
    number: number
    state: 'open' | 'closed'
    locked: boolean
    title: string
    user: User
    body: string
    labels: Label[]
    created_at: string
    updated_at: string
    closed_at: string
    merged_at: string
    merge_commit_sha: string
    assignee: User
    assignees: User[]
    requested_reviewers: User[]
    head: Branch
    base: Branch
}

export interface PullRequestEvent {
    action: PullRequestAction
    number: number
    pull_request?: PullRequest
}
