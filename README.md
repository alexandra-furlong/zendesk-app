# Zendesk-App

A lightweight frontend application that mimics a Zendesk sidebar app. It displays ticket info and a computed priority score based on defined logic. 

Please note this app has been packaged and uploaded to zendesk as a private app under the name <ins>Ticket Priority Assistant</ins>, but I can share my app_id or login information if needed.

[Figma Project Link](https://www.figma.com/design/HnxQB4QHWhnraKlOw95ar2/Zendesk-App?node-id=0-1&t=pF52ebFn1KM0vs5y-1)

### The following information is displayed on the sidebar app:

- Priority score (0-100 points)
- Ticket subject
- Created at
- SLA Due date
- Originally assigned priority status
- Tags

### Priority Score Logic

The priority score is calculated by adding up points from 3 different factors with a maxium
of 100 points total. Therefore, the higher the score the more it needs to be prioritized.

Factor #1 is the base priority score based on the ticket's
assigned priority level:

- Urgent = +50 points
- High = +40 points
- Normal = +20 points
- Low = +10 points

Factor #2 is based on how many days are left given the ticket's SLA time window
assigned priority level:

- Reached 100% of the SLA = +100 points (if exceeded the SLA, it needs to be escalated asap)
- Reached 80% of the SLA = +45 points
- Reached 50% of the SLA = +25 points
- Reached 49% or less = +0 points

Factor #3 is based on any critical tags assigned to the ticket (+40 points; does not stack):

- "outage"
- "blocker"
- "critical"
- "urgent"
- "vip_client"

### CSS Styling

I opted for a simple and clean design to focus more on aligning the style with Zendesk's UI.
Text font, sizing and colors are the exact same as Zendesk's UI except for the colored priority icons.

> [!NOTE]
> I had trouble finding a list of common zendesk tags so this list is not very inclusive.

### Core

- [x] Display ticket metadata (subject, priority, SLA due, tags).
- [x] Compute a simple 'Priority Score' based on defined logic (e.g., SLA time, tags, sentiment
      score).
- [x] Use React, plain JavaScript, or Handlebars to build the UI.
- [x] Use mock data

### Stretch Goals

- [x] Integrate with the Zendesk Ticket API to fetch real ticket data using a Zendesk
      developer account and API token.
- [ ] Allow agents to update ticket fields ( TBA 😭)
- [ ] Theme customization ( TBA 😶)
- [ ] Use a Node.js or Go backend service to simulate sentiment scoring from ticket text. ( very soon 😎)
