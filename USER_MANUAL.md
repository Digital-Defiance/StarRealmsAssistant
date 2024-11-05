# Unofficial Dominion Assistant User Manual

## Overview

This tool is designed to enhance your Dominion game experience by assisting with player setup, resource management, and score tracking. The assistant complements the physical Dominion game and offers additional tracking and automation features for smoother gameplay.

---

## Game Setup Phase

### Step 1: Player Setup

1. Add 2-6 players:
   - Enter each player's name in the input field.
   - Click **Add Player** for each entry.
2. Customize player colors (optional):
   - Click the color box next to each player’s name to select a color.
3. Remove players as needed by clicking **Remove**.
4. Click **Next** when you’re ready to proceed.

### Step 2: First Player Selection

1. Select the starting player from the player list.
2. (Optional) Click **Random Selection** to pick a starting player at random.
3. Click **Next** to move to game options.

### Step 3: Configure Game Options

1. Set your desired game settings:

   - **Curses**: Enabled by default.

   - **Track Card Counts** and **Track Card Gains**: Optional settings to monitor the supply and acquisitions of cards.

   - Expansions and Mats

     :

     - **Prosperity**: Adds Colonies and Platinum cards.
     - **Renaissance**: Enables Coffers and Villagers.
     - **Rising Sun**: Enables Prophecy tokens.

2. Click **Start Game** to begin the game.

---

## Gameplay Phase

### Interface Tabs

1. **Player Tab**:
   The main control panel for each player’s actions and resources.
2. **Adjustments Tab**:
   Review and manage resource modifications, track turn-by-turn changes, and view linked actions.
3. **Supply Tab**:
   Monitor the availability of cards in the supply, including kingdom cards and other game cards.

### Resource Management

1. **Basic Resources**:
   - **Actions**: Needed to play action cards.
   - **Buys**: Used to buy additional cards each turn.
   - **Coins**: Represents purchasing power.
   - **Victory Points**: Tracks each player’s score.
2. **Special Resources**:
   - **Villagers**: Stores additional actions for future turns.
   - **Coffers**: Stores extra coins for future use.
   - **Prophecy Tokens**: Available with the Rising Sun expansion.
   - **Victory Tokens**: Tracks special point values that don’t require physical VP cards.

### Game Controls

1. **Action Buttons**:
   - **Next Turn**: Ends the current player's turn and advances to the next.
   - **End Game**: Ends the game and displays final scores.
   - **Undo**: Reverts the last action taken.
   - **Pause/Unpause**: Pauses or resumes the game.
2. **Correction Mode**:
   - Activate this mode by checking the **Correction** box. It allows you to adjust resources manually without automatic linking.
   - Marked with a ✏️ icon in the game log to indicate corrections.
3. **Linking Actions**:
   - Enable the **Link Actions** checkbox to group related resource changes together.
   - Linked actions can be undone as a single unit, making it useful for multi-step card effects.

---

## Advanced Tracking Features

### Next Turn Effects

To manage effects that trigger on your next turn:

1. Click the ⚙️ (gear) icon in your player panel.
2. In the "Next Turn" popover:
   - **Barracks**: Add +1 to "Actions".
   - **Flag Bearer**: Add +1 to "Cards".
3. These adjustments will automatically apply at the start of your next turn.

### Victory Point Tracking

To track victory points that vary based on conditions:

1. Use the **Other** field in the Victory section.

2. For cards like

   Demesne

   (worth 1 VP per Gold card):

   - Count your Gold cards.
   - Use the +/- buttons to add or remove that many victory points.
   - Example: If you have 3 Gold cards, press + three times.

3. These points persist between turns, accurately tracking conditional VPs.

### Manual Tracking Tips

- Use **Correction Mode** (pencil icon) to make adjustments for any mistakes.
- Use the **Link Actions** option (chain icon) for grouping related actions, such as effects from complex card plays.
- The **Game Log** will display all actions and adjustments for easy review.
- Use the 🗑️ icon to track points from cards that are trashed.

---

## Game Statistics

The tool automatically tracks and displays statistics, including:

- **Total Game Duration**: The entire duration of the game.
- **Current Turn Time**: How long the current turn has lasted.
- **Average Turn Duration**: An average of all player turn times.
- **Player-Specific Averages**: Average time taken per player.
- **Victory Point Tracking**: Comprehensive victory point tally per player.
- **Supply Count Tracking**: Keeps track of remaining cards in the supply.

### Auto-Save Feature

- The tool saves the game state automatically after each action.
- Supports multiple save slots and allows importing and exporting game data.
- Includes version compatibility checks to ensure seamless use across updates.

---

## End Game

1. Click the **End Game** button when the game concludes.
2. Confirm your choice in the dialog prompt.
3. View the final scores and game statistics.
4. Optionally, start a new game by returning to the setup phase.

**Note**: This tool is an unofficial companion to the physical Dominion game. While it supports many expansions, not all are directly implemented; manual adjustments can be used to account for unsupported features.
