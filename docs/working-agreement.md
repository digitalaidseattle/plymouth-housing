# Sections of a Working Agreement

A working agreement is a document, or a set of documents that describe how we work together as a team and what our
expectations and principles are.

## General  

- We work as one team towards a common goal and clear scope. 
- We make sure everyone's voice is heard, listened to
- We show all team members equal respect
- We work as a team to have common expectations for technical delivery
- We make sure to spread our expertise and skills in the team, so no single person is relied on for one skill
- All times below are listed in PST

## Communication

- We communicate all information relevant to the team through the Project Slack channel
- We add all technical spikes, trade studies, and other technical documentation to the project repository through async design reviews in PRs.

## Work-life Balance

- We strive to work a minimum of 4 hours a week. 
- We work in a volunteering org and respect this, especially when setting up recurring meetings.
- We record meetings when possible, so that team members who could not attend live can listen later.

## Quality and not Quantity

- We agree on a [Definition of Done](https://github.com/microsoft/code-with-engineering-playbook/blob/main/docs/agile-development/team-agreements/definition-of-done.md) for our user story's and live by it.
- We follow engineering best practices like the [Engineering Fundamentals Engineering Playbook](https://github.com/microsoft/code-with-engineering-playbook)

## Scrum Rhythm

We follow a simple [Kanban](https://www.atlassian.com/agile/kanban) method without sprints. Tasks and stories will move across the board and new tasks can be picked up or assigned from To-do column. 

| Activity | When | Duration | Who | Accountable | Goal |
| -- | -- | -- | -- | -- | -- |
| Async Standup | Mon 5.30PM in Slack | NA   | Everyone     | Project Manager | What has been accomplished, next steps, blockers                           |
| Project Standup | Thu 5.30PM           | 30 min   | Everyone     | Project Manager | What has been accomplished, next steps, blockers                           |
| Dev Sync | Fri 5.45PM           | 45 min   | Devs     | Devs | Open hours for getting over hurdles |
| Demo                                           | When feature is done            | -   | Everyone     | Solution Architect     | Present work done and sign off on user story completion                    |
| Retro | TBD           | TBD   | Everyone     | Project Manager | Dev Teams shares learnings and what can be improved                        |
| Planning | NA           | NA   | NA     | NA           | NA                                  |
| Task Creation | After taking user story | -        | Dev      | Dev      | Create tasks to clarify and determine velocity                             |
| Backlog refinement | TBD         | 1 hour   | Solution Architect, PO | PO           | Prepare for next few weeks and ensure that stories are ready. |

## Process Lead

The Project Manager is responsible for leading any scrum or agile practices to enable the project to move forward.

- Facilitate standup meetings and hold team accountable for attendance and participation.
- Keep the meeting moving as described in the [Project Standup](https://github.com/microsoft/code-with-engineering-playbook/blob/main/docs/agile-development/ceremonies.md) page.
- Make sure all action items are documented and ensure each has an owner and a due date and tracks the open issues.
- We keep our notes in [Miro](https://miro.com/app/board/uXjVK69-jvE=/)
- Notes as needed after planning / stand-ups.
- Make sure that items are moved to the parking lot and ensure follow-up afterwards.
- Maintain a location showing team’s work and status and removing impediments that are blocking the team.
- Hold the team accountable for results in a supportive fashion.
- Make sure that project and program documentation are up-to-date.
- Guarantee the tracking/following up on action items from retrospectives (iteration and release planning) and from daily standup meetings.
- Facilitate the retrospective.
- Coach Product Owner and the team in the process, as needed.

## Backlog Management

- We keep our board in [Jira](https://das-ph-inventory-tracker.atlassian.net/jira/core/projects/PIT/board)
- We work together on a [Definition of Ready](https://github.com/microsoft/code-with-engineering-playbook/blob/main/docs/agile-development/team-agreements/definition-of-ready.md) and all user stories need to follow this
- We communicate what we are working on through the board
- We assign ourselves a task when we are ready to work on it (not before) and move it to active
- We capture any work we do related to the project in a user story/task
- We close our tasks/user stories only when they are done (as described in the [Definition of Done](https://github.com/microsoft/code-with-engineering-playbook/blob/main/docs/agile-development/team-agreements/definition-of-done.md))
- We work with the PM if we want to add a new user story to the backlog
- If we add new tasks to the board, we make sure it matches the acceptance criteria of the user story (to avoid scope creep).
  If it doesn't match the acceptance criteria we should discuss with the PM to see if we need a new user story for the task or if we should adjust the acceptance criteria.

## Code Management

- We follow the git flow branch naming convention for branches and identify the task number e.g. `name/123-add-working-agreement`
- We merge all code into main branch through PRs
- All PRs are reviewed by one person from DAS
- We always review existing PRs before starting work on a new task
- We look through open PRs at the end of stand-up to make sure all PRs have reviewers.
- We treat documentation as code and apply the same standards to Markdown as code.
- We have our designs in Figma. 
