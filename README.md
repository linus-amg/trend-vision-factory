# Visionary
Submission for Anthropic's "Build with Claude" 2024 contest

<img width="1118" alt="image" src="https://github.com/linus-amg/trend-vision-factory/assets/7453396/c9d4a37d-a7f9-4ab3-b419-dc95c9b7ad81">

## Description
Proof of concept for an application which supports it's users in generating testable ideas for their products.

## Pre-requisites
You will need to enter your own Anthropic API Key, other than that his mono-repository contains everything to run the "trend-vision-factory" on your own machine.

## Inspiration
Inspired by Anthropic's "vision talks" which happens every couple weeks (https://www.youtube.com/watch?v=xm6jNMSFT7g&t=3616s)

Generate analysis, insight and recommendations
- Strategically
- what do you think is gonna be big
- Commercial, Research, Public Benefit

For any product by submitting screenshots of the product UI in combination with current trends of each industry

## Follow principles
- build the simple thing which works
  - excluding usage of long-term solutions for problems I won't have in the short term while creating this PoC
- build optimistically
- use TypeScript
- use a quick to prototype ui library (chakra-ui)
- waive security concerns over speed of development and focus on the positive showcase
  - no authentication
  - no limits
  - no moderation
- use vercel/postgres and vercel/blob for persisting data and images
- waive as much infrastructure as possible
  - no docker, no other cloud provider setup

# Needs
- A user putting in an URL or Screenshots of the product they want to analyze

## Ways to get screenshots
- scrape public website/app
- direct screenshot upload
- direct video upload
  - we will generate the screenshots off of that

# Input

## Source of truth
- URL
We will use the URL to visit the product and click/scrape around and create screenshots (or videos)
- Alternatively a video of the product or screenshots can be uploaded (more content of the app = better recommendations?)
- Optional: define the last vision of the product or recent changes

## Use the URL to figure out:
- product name
- company behind it
- industry the company works in
- headcount
- likely goals
- if IPO'd, get reports and analyse

# Output
Generate what kind of widgets and elements can improve user experience or revenue
- Sketches of recommended elements depending on industry, e.g. ADs, videos, descriptions, text corrections
- feature ideas
- improvements to existing features

# Highlight
Interpretability, show it's progress while this "assistant" is visiting the website and get realtime analysis, as if the user and the assistant are pairing on this task.
Try to work together and develop a natural work-flow, example:
1) User enter's URL
2) Assitant figures out key data of the product + company and asks the user if this looks correct
3) User confirms key data
4) In the meanwhile the Assistant was already scraping the URL and creating screenshots
5) Assistant sends one screenshot with it's description of what it is (probably landing page)
6) User confirms or adds additional information
7) Assistant sends next screenshot
8) User can continue answering or say stop that's enough, take me to the analyssis

The final document could be a PDF or Slides which present ideas

Important would be to separate the queue of investigation with the queue of the conversation, so that investigation does not depend on waiting times but can happen optimisically

# Future ideas
- add tests
- add fixes and automation against vulnerabilities
- add authentication

currently those important assets are skipped on purpose to accelerate the proof-of-concept development
