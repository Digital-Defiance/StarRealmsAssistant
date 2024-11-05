[![Codacy Badge](https://app.codacy.com/project/badge/Grade/6875e251bae24f99bab9d7b53ad8d2eb)](https://app.codacy.com/gh/Digital-Defiance/DominionAssistant/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

# Unofficial Dominion Assistant

Welcome to the **Unofficial Dominion Assistant**, a React application designed to enhance your gameplay experience for the popular card game, Dominion! This tool provides comprehensive features for game management, scoring, and player interaction, allowing Dominion enthusiasts to focus on strategy and enjoyment.

Unofficial Dominion Assistant is a free tool which aimed to support the main features of the game and the ones we used personally. Many of the specfific expansions and cards are not specifically supported but should allow for manual adjustment to accommodate them.
Please see our GitHub [issues](https://github.com/Digital-Defiance/DominionAssistant/issues) page for our roadmap/upcoming features and to make requests.

## Disclaimer for End Users

This software runs entirely in the browser and should not affect the local machine, but game state may not be accurately tracked and may affect the outcome of games. This tool should not (yet?) be relied upon for tournaments or anything where it is not being used for personal use. The project is provided "as-is" without any warranties or guarantees. Use at your own risk. The authors are not responsible for any damage or data loss that may occur from using this software.

Especially as a free tool, we make no guarantees, waranty, or promises of bug-free accuracy or that we will implement all suggestions. Our time is limited and this project is made and run for free. If you'd like to donate to [Digital Defiance](https://digitaldefiance.org) to facilitate specific features or support development, that would be greatly appreciated. Donations will not be refunded and we make no guarantees that a donation will ensure a requested change is made, though we will certainly make the effort if possible.

Please note that the Unofficial Dominion Assistant is not affiliated with or endorsed by the makers of Dominion or Donald X Vaccarino. This application is a fan-built project created to enhance your gameplay experience and requires ownership of the physical Dominion game to use. It does not allow you to play without having the original game. The use of the Dominion logo is intended solely for personal use to support the Dominion community and should be considered under the _Fair Use Doctrine_.

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
- **Expansion Support**: Compatibility with various Dominion expansions and game mats
- **Save/Load Games**: Ability to save game progress and resume later
- **Intuitive UI**: User-friendly interface with Material-UI components

This is an [NX](https://nx.dev/getting-started/intro) project created with [`create-nx-workspace`](https://nx.dev/nx-api/nx/documents/create-nx-workspace).

## Roadmap/Upcoming Features

- Confirm end game with dialog
- Game timer visible
- Auto-save after each event
- Graph of victory points over time
- Track turn card gains
- +card tracking (optional/enable-able)
- Council-Room button?
- Implement pause/unpause game enhancement: may be covered by save/load?

## Getting Started

### Prerequisites

- Node.js (version 20.9.0 or higher)
- yarn (version 1.22.22 or higher)
- NX CLI

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/Digital-Defiance/DominionAssistant.git
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
   git clone https://github.com/Digital-Defiance/DominionAssistant.git
   ```

2. Open the project folder in Visual Studio Code.
3. Set up .env:

- Copy the .env.example in the project root to .env
- Fill in the CODACY_PROJECT_TOKEN from https://app.codacy.com/gh/Digital-Defiance/DominionAssistant/settings/coverage
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
2. Dominion Assistant (main game screen)
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
- yarn test:jest:single: Runs a single specified test (eg yarn test:jest:single src/game/**tests**/dominion-lib-load-save-saveGame.spec.ts)
- yarn test:playwright: Runs playwright e2e tests
- yarn test:playwright:report: Shows the playwright report
- yarn lint:eslint: Runs ESLint
- yarn lint:eslint:fix: Runs ESLint with auto-fix option
- yarn lint:prettier:fix: Runs Prettier to format various file types
- yarn clean: Removes dist/coverage directories
- yarn reset: Removes node_modules, dist, coverage, and runs yarn install again

## Contributing

We welcome contributions to Dominion Assistant! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- The creators of Dominion for inspiring this project
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

### Wed Nev 06 17:05:00 2024

- Version 0.10.0
  - Add common actions with support for cards like council room which add cards now for other players and remove them on their turns

### Mon Nov 04 12:44:00 2024

- Version 0.9.10
  - Remove curses/colonies from statistics graphing when disabled

### Mon Nov 04 12:34:00 2024

- Version 0.9.9
  - Reworked Game Log screen completely to improve performance

### Sun Nov 03 21:51:00 2024

- Version 0.9.8
  - Add options to show/hide track cards and track gains

### Sun Nov 03 21:01:00 2024

- Version 0.9.7
  - FloatingCounter background color to match player
  - Fix player checkboxes positioning

### Sun Nov 03 16:24:00 2024

- Version 0.9.6
  - GameClock to use caching functions
  - New overlay with quick reference counters

### Sun Nov 03 14:53:00 2024

- Version 0.9.5
  - Added average actions per turn statistic

### Sun Nov 03 14:10:00 2024

- Version 0.9.4
  - Subtle tweaks to increment/decrement tooltips
  - Rename GameScreen to GameInterface
  - Rename CurrentStep.GameScreen to CurrentStep.Game
  - Show no adjustments instead of empty table in Turn Adjustments component

### Sun Nov 03 13:52:00 2024

- Version 0.9.3
  - Rework game display, add Turn Adjustments feature which summarizes the changes in the current turn
  - Rework game log, add Turn Adjustments feature which summarizes the changes in a given turn

### Sat Nov 02 22:23:00 2024

- Version 0.9.2
  - Add link checkbox to link changes together

### Sat Nov 02 20:21:00 2024

- Version 0.9.1
  - Tiny hotfix to fix the add players page breaking due to recent changesl

### Fri Nov 01 11:45:00 2024

- Version 0.9.0
  - Breaks save game compatibility by changing some property names in the save game
  - Adds version compatibility check when loading and importing save games
  - Reworked cache system to try and improve the game log and statistics pages
    - Implemented new functions for `rebuildCaches` and `updateCachesForEntry` to handle game log caching
    - Adjusted `applyLogAction` and `addLogEntry` to work with new caching functions
  - Improved `loadGame` to support reloading of cached data and updated error handling in `loadGameAddLog`
  - Updated the `StatisticsScreen` to rely on the new updateCachesForEntry function via addLogEntry
  - Updated tests to mock `updateCachesForEntry` and ensure accurate time cache and statistics calculations
  - Added simulated game generator with customizable turn count for testing game log performance
  - Refactored `dominion-lib-fixtures.ts` to simplify mocked log entries for tests
  - Minor optimizations and bug fixes
  - Added s3 deployment YAML to auto-deploy to S3 on version tag
  - Fixed initial supply amounts to use table from BoardGameGeek

### Thu Oct 31 11:45:00 2024

- Version 0.8.0
  - Extend caching functionality so that statistics page is rendered faster

### Mon Oct 28 20:00:00 2024

- Version 0.7.0
  - Add import functionality
  - Add caching of game time calculations so that game log is rendered faster on a big game

### Sun Oct 27 16:13:00 2024

- Version 0.6.1
  - Fix game log/statistics scrollability at bottom for tab bar

### Sun Oct 27 16:00:00 2024

- Version 0.6.0
  - Added turn card gains count tracking

### Sun Oct 27 15:35:00 2024

- Version 0.5.0
  - Added turn/new turn card count tracking

### Sun Oct 27 14:39:00 2024

- Version 0.4.1
  - Restricted Load/Save screen from saving over auto saves
  - Fixed viewport issues and start working towards responsiveness to different screen sizes.

### Sat Oct 26 14:46:00 2024

- Version 0.4.0
  - Added autosave functionality to save game progress after each state change.

### Sat Oct 26 14:01:00 2024

- Version 0.3.0
  - Added load/save game functionality

### Fri Oct 25 16:31:00 2024

- Version 0.2.0
  - New Feature: Added detailed victory point tracking by turn in calculateVictoryPointsAndSupplyByTurn, supporting graphical representation.
  - UI Enhancements: Introduced StatisticsScreen for game statistics display with line charts for player scores, supply counts, and turn durations.
  - Game Log Updates: Added trash option for log entries, ensuring trashed items don't impact supply counts.
  - Error Handling: Introduced InvalidTrashActionError for invalid trash actions.
  - Dependencies: Integrated chart.js and react-chartjs-2 for graphing capabilities.
  - Other Enhancements: Refactored game setup and mock creation for better test coverage and clarity.

### Fri Oct 25 11:10:00 2024

- Added
  - Added VERSION_NUMBER constant in constants.ts.
  - Displayed the version number in the AboutScreen.
- Changed
  - Modified the font size of the GameClock component to 1rem for better readability.
  - Updated GameInterface to conditionally render the GameClock component only if the viewport width is greater than 1300 pixels.
  - Enhanced the IncrementDecrementControl component to include a trash icon button for decrementing victory fields.
  - Updated the Player component to handle the trash action for victory fields.
- Fixed
  - Fixed the supply decrement logic in updatePlayerField to account for the victoryTrash flag.

### Fri Oct 25 00:40:30 2024

- Add confirm end game dialog

### Thu Oct 24 22:24:59 2024

- **Feature**: Added GameClock component to display the game time, current turn time, average turn time, and the average turn time for the current player
  - The GameClock component shows the total game time, current turn time, average turn time, and the average turn time for the current player
  - Updated the GameLogEntry component to format date and time correctly.
  - Adjusted the position of the GameClock component to ensure all lines are visible.
  - Added tests for the new functions.
  - Fixed bug in computation of game time
  - Fixed bugs in NEXT_TURN properties

### Thu Oct 24 17:10:15 2024

- **Improvement**: Improve about/disclaimer/readme

### Thu Oct 24 17:04:19 2024

- **Improvement**: Avoid combined actions when correcting.

### Thu Oct 24 16:59:18 2024

- **Fix**: Resolved bug preventing the addition of the last victory card.

### Thu Oct 24 06:36:44 2024

- Enhancement

  :

  - Added turn to log entries.
  - Display turn number in the next turn.
  - Fixed linked action issues in player component and log.

### Wed Oct 23 21:27:10 2024

- **Feature**: Enabled undo for the most recent select/next turn.

### Wed Oct 23 20:38:23 2024

- **Improvement**: Enhanced game log readability.

### Wed Oct 23 20:19:42 2024

- **Maintenance**: Codacy/lint fixes.

### Wed Oct 23 19:42:05 2024

- **Improvement**: Improved typing.

### Wed Oct 23 19:35:58 2024

- **Feature**: Added typings.

### Wed Oct 23 19:22:54 2024

- **Fix**: Tracked currentPlayerIndex in log entries and fixed game log.

### Wed Oct 23 18:29:00 2024

- Improvement

  :

  - Improved endgame display.
  - Allowed ties in rankings.
  - Improved select first player.
  - Fixed first player state.

### Tue Oct 22 23:02:36 2024

- **Maintenance**: Addressed linting issues.

### Tue Oct 22 22:35:19 2024

- **Cleanup**: Removed unused variables.

### Tue Oct 22 22:30:14 2024

- **Refactor**: Reworked log/start/next.

### Tue Oct 22 08:29:14 2024

- UI Rework

  :

  - Relied more on CSS for font sizes.
  - Converted all fonts to WOFF/WOFF2.
  - Used Minion over Trajan in many places.
  - Homogenized tab centering components.

### Sat Oct 19 19:44:24 2024

- Refactor

  :

  - Moved sizing constants into theme.
  - Removed 'any' types.
  - Improved type safety and centralized sizing in theme.

### Sat Oct 19 19:00:47 2024

- **Maintenance**: Attempted to resolve ESLint issues.

### Sat Oct 19 18:42:35 2024

- **Feature**: Migrated to flat ESLint config and updated Prettier to v3.

### Fri Oct 18 20:36:49 2024

- **Update**: Included GitHub Actions extension in devcontainer.

### Fri Oct 18 20:18:17 2024

- **Feature**: Uploaded coverage to Codacy.

### Fri Oct 18 20:00:57 2024

- **Setup**: Configured zshrc/bashrc to load DOTENV_CONFIG_PATH.

### Fri Oct 18 19:03:21 2024

- **Setup**: Configured Codacy environment.

### Fri Oct 18 18:16:37 2024

- Feature

  :

  - Set NO_PLAYER for NEXT_TURN and SELECT_PLAYER actions.
  - Added getPreviousPlayerIndex.
  - Updated tests.

### Fri Oct 18 17:16:58 2024

- **Fix**: Corrected getTimeSpanFromStartGame to handle consecutive saves.

### Fri Oct 18 00:49:42 2024

- **Feature**: Added logic to add the save game log entry when saving.

### Fri Oct 18 00:33:09 2024

- **Refactor**: Reworked storage system.

### Thu Oct 17 06:13:25 2024

- **Removal**: Removed 'cross-platform' feature since now react only.

### Thu Oct 17 06:09:45 2024

- **Fix**: Fixed Playwright server.

### Thu Oct 17 05:47:57 2024

- Fix

  :

  - Resolved Playwright/Jest overlap.
  - Fixed canUndoAction to only undo NEXT_TURN of NoPlayerActions.
  - Moved set-kingdom base/prosperity to **tests**.
  - Moved app.spec.tsx to **tests**.

### Thu Oct 17 04:09:06 2024

- UI Improvement

  :

  - Removed margin on Scoreboard.
  - Moved correction checkbox to within Player component.

### Wed Oct 16 23:35:01 2024

- **Setup**: Installed Copilot CLI in devcontainer and hid canUndo for START_GAME.

### Wed Oct 16 23:15:16 2024

- **Fix**: Corrected useMemo.

### Wed Oct 16 22:09:42 2024

- Improvement

  :

  - Improved titles.
  - Moved canUndo CurrentStep check into canUndoAction.

### Wed Oct 16 21:49:59 2024

- Fix

  :

  - Removed react-native 8081 port forward.
  - Fixed TabView/App to render only single tab.
  - Fixed duplicate about screen.
  - Fixed canUndo error when not in CurrentStep.Game.
  - Added sx property option for SuperCapsText.
  - Used MUI styled instead of emotion styled.
  - Improved About screen sub-panel titles to use SuperCapsText.

### Wed Oct 16 18:49:42 2024

- **Maintenance**: Lint/Prettier fixes.

### Wed Oct 16 18:27:13 2024

- **Cleanup**: Removed Zone identifier.

### Wed Oct 16 18:22:02 2024

- **Migration**: Migrated to plain React.

### Mon Oct 14 15:31:35 2024

- **Conversion**: Converted from react-native. Addresses #12.

### Tue Oct 8 02:28:01 2024

- **Enhancement**: Split up dominion-lib and added tests.

### Tue Oct 8 18:13:56 2024

- **Fix**: Set color when editing different user. Closes #8.

### Tue Oct 8 18:00:34 2024

- **Fix**: Corrected overwrite save game.

### Tue Oct 8 17:32:25 2024

- **Improvement**: Enhanced load save functionality. Closes #11.

### Mon Oct 7 22:22:17 2024

- **Feature**: Removed HelloWave and added Correction checkbox. Closes #7.

### Mon Oct 7 20:20:45 2024

- **Fix**: Corrected README.

### Mon Oct 7 20:17:31 2024

- Refactor

  :

  - Removed global mats component.
  - Integrated into Player.
  - Redid SuperCaps to be Tooltip compatible.
  - Made IncrementDecrementControl have optional tooltip on the label.

### Mon Oct 7 19:39:57 2024

- **Feature**: Defaulted to curses enabled.

### Mon Oct 7 18:24:06 2024

- **Setup**: Codacy configuration.

### Mon Oct 7 18:07:07 2024

- **Switch**: Changed ESLint configs.

### Mon Oct 7 10:39:32 2024

- **Update**: Added Codacy badge to README.

### Mon Oct 7 17:36:41 2024

- **Improvement**: Enhanced home screen.

### Mon Sep 30 12:41:43 2024

- **Initial Commit**: Generated by create-expo-app 3.0.0.
