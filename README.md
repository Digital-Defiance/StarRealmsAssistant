[![CI](https://github.com/Digital-Defiance/StarRealmsAssistant/actions/workflows/ci.yml/badge.svg)](https://github.com/Digital-Defiance/StarRealmsAssistant/actions/workflows/ci.yml)

[![Deploy to S3](https://github.com/Digital-Defiance/StarRealmsAssistant/actions/workflows/deploy-to-s3.yml/badge.svg)](https://github.com/Digital-Defiance/StarRealmsAssistant/actions/workflows/deploy-to-s3.yml)

[![Test and Upload to Codacy](https://github.com/Digital-Defiance/StarRealmsAssistant/actions/workflows/test-and-upload-codacy.yml/badge.svg)](https://github.com/Digital-Defiance/StarRealmsAssistant/actions/workflows/test-and-upload-codacy.yml)

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/6875e251bae24f99bab9d7b53ad8d2eb)](https://app.codacy.com/gh/Digital-Defiance/StarRealmsAssistant/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

![image](https://github.com/user-attachments/assets/a1b11077-7bd6-4494-9c00-c9fb19131161)

# Unofficial Star Realms Assistant

Welcome to the **Unofficial Star Realms Assistant**, a React application designed to enhance your gameplay experience for the popular card game, Star Realms! This tool provides comprehensive features for game management, scoring, and player interaction, allowing Star Realms enthusiasts to focus on strategy and enjoyment.

Based on the original [**Unofficial Dominion Assistant**](https://github.com/Digital-Defiance/DominionAssistant) which is live on [dominionassistant.com](https://dominionassistant.com).

Unofficial Star Realms Assistant is a free tool which aimed to support the main features of the game and the ones we used personally. Many of the specfific expansions and cards are not specifically supported but should allow for manual adjustment to accommodate them.
Please see our GitHub [issues](https://github.com/Digital-Defiance/StarRealmsAssistant/issues) page for our roadmap/upcoming features and to make requests.

## Disclaimer for End Users

This software runs entirely in the browser and should not affect the local machine, but game state may not be accurately tracked and may affect the outcome of games. This tool should not (yet?) be relied upon for tournaments or anything where it is not being used for personal use. The project is provided "as-is" without any warranties or guarantees. Use at your own risk. The authors are not responsible for any damage or data loss that may occur from using this software.

Especially as a free tool, we make no guarantees, waranty, or promises of bug-free accuracy or that we will implement all suggestions. Our time is limited and this project is made and run for free. If you'd like to donate to [Digital Defiance](https://digitaldefiance.org) to facilitate specific features or support development, that would be greatly appreciated. Donations will not be refunded and we make no guarantees that a donation will ensure a requested change is made, though we will certainly make the effort if possible.

Please note that the Unofficial Star Realms Assistant is not affiliated with or endorsed by the makers of Star Realms or Wise Wizard Games. This application is a fan-built project created to enhance your gameplay experience and requires ownership of the physical Star Realms game to use. It does not allow you to play without having the original game. The use of the Star Realms logo is intended solely for personal use to support the Star Realms community and should be considered under the _Fair Use Doctrine_.

### Fair Use Doctrine

Under _17 U.S.C. § 107_, fair use allows limited use of copyrighted material without requiring permission from the rights holders. Factors to consider include:

- The purpose and character of the use (e.g., educational, non-commercial).
- The nature of the copyrighted work.
- The amount and substantiality of the portion used.
- The effect of the use on the potential market for the original work.

**Case References**:

- In _Campbell v. Acuff-Rose Music, Inc._, 510 U.S. 569 (1994), the U.S. Supreme Court emphasized that transformative uses of copyrighted material could qualify as fair use.
- In _Lentz v. Morrow_, 104 Cal.App.3d 392 (1980), the court upheld that using copyrighted material in a manner that requires the original for use is less likely to infringe on the copyright holder’s rights.

Our application, as a fan-built tool that does not replicate the game, could be argued as transformative.

## Features

- **Player Management**: Easily add, remove, and track multiple players
- **Dynamic Scoring**: Real-time score calculation and leaderboard
- **Game Setup Wizard**: Customizable options for various game modes and expansions
- **Turn Tracking**: Keep track of player turns and phases
- **Detailed Game Log**: Record and review game events and card plays
- **Expansion Support**: Compatibility with various Star Realms expansions and game mats
- **Save/Load Games**: Ability to save game progress and resume later
- **Intuitive UI**: User-friendly interface with Material-UI components
- Confirm end game with dialog
- Game timer visible
- Auto-save after each event
- Graph of authority over time
- Track turn card gains
- +card tracking (optional/enable-able)
- Council-Room and other card action buttons
- Pause/unpause game

This is an [NX](https://nx.dev/getting-started/intro) project created with [`create-nx-workspace`](https://nx.dev/nx-api/nx/documents/create-nx-workspace).

## Roadmap/Upcoming Features

- No features are planned at this time. Please suggest one.

## Getting Started

### Prerequisites

- Node.js (version 20.9.0 or higher)
- yarn (version 1.22.22 or higher)
- NX CLI

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Digital-Defiance/StarRealmsAssistant.git
   ```

From here you may follow the instructions below or jump to the section on Dev Container usage.

2. Install dependencies

   ```bash
   yarn install
   ```

3. Start the app

   ```bash
    yarn start
   ```

A popup should offer to open the application in a browser.

### Visual Studio Code Dev Container Preqrequisites

- [Visual Studio Code](https://code.visualstudio.com/)
- [Docker](https://www.docker.com/products/docker-desktop)
- [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension for VS Code

### Development with VS Code Dev Container

1. Clone the repository:

   ```bash
   git clone https://github.com/Digital-Defiance/StarRealmsAssistant.git
   ```

2. Open the project folder in Visual Studio Code.
3. Set up .env:

- Copy the .env.example in the project root to .env
- Fill in the CODACY_PROJECT_TOKEN from https://app.codacy.com/gh/Digital-Defiance/StarRealmsAssistant/settings/coverage
- Save the .env file

4. When prompted, click "Reopen in Container" or use the command palette (F1) and select "Remote-Containers: Reopen in Container".
5. VS Code will build the dev container and set up the environment. This may take a few minutes the first time.
6. Once the container is ready, open a new terminal in VS Code and run:
   ```bash
   yarn install
   ```
7. Start the app:
   ```bash
   yarn start
   ```

A popup should offer to open the application in a browser.

### Preferred Development Environment

We highly recommend using Visual Studio Code Dev Containers/Docker for a consistent and isolated development environment. This ensures that all dependencies and configurations are standardized across different development setups.

The devcontainer.json postCreateCommand will run through setup of NVM to select a desired version of Node, perform the yarn install, and install the nx cli globals.

## Usage

Once the application is started with yarn start-

The app consists of several main screens:

1. Home Screen
2. Star Realms Assistant (main game screen)
3. Game Log
4. Load/Save Game

Navigate through these screens using the tab bar at the bottom of the app.

To start a new game:

1. Add player names
2. Set game options (including expansions and special rules)
3. Start the game and use the interface to track scores, turns, and game events

## Development

Other commands available:

- yarn start: Starts the development server
- yarn build: Builds the app using NX
- yarn test:jest: Runs Jest tests
- yarn test:jest:single: Runs a single specified test (eg yarn test:jest:single src/game/**tests**/Star Realms-lib-load-save-saveGame.spec.ts)
- yarn test:playwright: Runs playwright e2e tests
- yarn test:playwright:report: Shows the playwright report
- yarn lint:eslint: Runs ESLint
- yarn lint:eslint:fix: Runs ESLint with auto-fix option
- yarn lint:prettier:fix: Runs Prettier to format various file types
- yarn clean: Removes dist/coverage directories
- yarn reset: Removes node_modules, dist, coverage, and runs yarn install again

## Contributing

We welcome contributions to Star Realms Assistant! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- The creators of Star Realms for inspiring this project
- React and NX for providing the development framework
- Material-UI for the component library
- Digital Defiance and Jessica Mulein for facilitating and creating this work

## Learn more

To learn more about developing on this project, look at the following resources:

- [NX](https://nx.dev/getting-started/intro)
- [React](https://react.dev/learn)
- [Material UI](https://mui.com/material-ui/)
- [Jest](https://jestjs.io/)
- [Playwright](https://playwright.dev/)
- [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/)
- [Tabnine](https://www.tabnine.com/)
- [Greptile](https://www.greptile.com/)
- [CoPilot](https://github.com/features/copilot)

## Join the community

Join our community of developers.

- [Digital Defiance](https://digitaldefiance.org): 501c3 Non Profit Open Source Engineering Guild, with our own Discord.

## Changelog

### Wed Mar 05 14:37:00 2024

- **Initial Commit**: Brought over from dominion assistant.
