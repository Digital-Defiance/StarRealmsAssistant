[![Codacy Badge](https://app.codacy.com/project/badge/Grade/6875e251bae24f99bab9d7b53ad8d2eb)](https://app.codacy.com/gh/Digital-Defiance/DominionAssistant/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

# Unofficial Dominion Assistant

Welcome to the **Unofficial Dominion Assistant**, a React Native application designed to enhance your gameplay experience for the popular card game, Dominion! This tool provides comprehensive features for game management, scoring, and player interaction, allowing Dominion enthusiasts to focus on strategy and enjoyment.

## Disclaimer for End Users

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
- **Cross-Platform**: Works on iOS, Android, and web browsers

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Getting Started

### Prerequisites

- Node.js (version 20.9.0 or higher)
- yarn (version 1.22.22 or higher)
- Expo CLI

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

In the output, you'll find options to open the app in a development build, Android emulator, iOS simulator, or Expo Go.

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
3. When prompted, click "Reopen in Container" or use the command palette (F1) and select "Remote-Containers: Reopen in Container".
4. VS Code will build the dev container and set up the environment. This may take a few minutes the first time.
5. Once the container is ready, open a new terminal in VS Code and run:
   ```bash
   yarn install
   ```
6. Start the app:
   ```bash
   yarn start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

### Preferred Development Environment

We highly recommend using Visual Studio Code Dev Containers/Docker for a consistent and isolated development environment. This ensures that all dependencies and configurations are standardized across different development setups.

The devcontainer.json postCreateCommand will run through setup of NVM to select a desired version of Node, perform the yarn install, and install the expo-cli globals.

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

- yarn start: Starts the Expo development server
- yarn android: Starts the app on Android
- yarn build:android: Builds the Android app using EAS with a preview profile
- yarn build:ios: Builds the iOS app using EAS with a preview profile
- yarn ios: Starts the app on iOS
- yarn web: Starts the app for web
- yarn test: Runs Jest tests in watch mode
- yarn lint: Runs the Expo linter
- yarn lint:eslint:fix: Runs ESLint with auto-fix option
- yarn format: Runs Prettier to format various file types

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

To learn more about developing your project, look at the following resources:

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
