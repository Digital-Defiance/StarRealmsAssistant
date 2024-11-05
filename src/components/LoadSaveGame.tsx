import React, { useState, useEffect, useRef, FC, ChangeEvent } from 'react';
import { useGameContext } from '@/components/GameContext';
import {
  saveGame,
  loadGame,
  getSavedGamesList,
  deleteSavedGame,
  loadGameJsonFromStorage,
  restoreSavedGame,
} from '@/game/dominion-lib-load-save';
import { ISavedGameMetadata } from '@/game/interfaces/saved-game-metadata';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  ArrowRight as ArrowRightIcon,
  Delete as DeleteIcon,
  SaveAlt as SaveAltIcon,
  Save as SaveIcon,
  Upload as UploadIcon,
} from '@mui/icons-material';
import { CurrentStep } from '@/game/enumerations/current-step';
import { useAlert } from '@/components/AlertContext';
import { LocalStorageService } from '@/game/local-storage-service';
import { AutoSaveGameSaveName } from '@/game/constants';
import { deepClone } from '@/game/utils';
import { IGame } from '@/game/interfaces/game';
import { IGameRaw } from '@/game/interfaces/game-raw';
import { IncompatibleSaveError } from '@/game/errors/incompatible-save';

const LoadSaveGame: FC = () => {
  const { showAlert } = useAlert();
  const [openDialog, setOpenDialog] = useState(false);
  const [openOverwriteDialog, setOpenOverwriteDialog] = useState(false);
  const { gameState, setGameState } = useGameContext();
  const [savedGames, setSavedGames] = useState<ISavedGameMetadata[]>([]);
  const [saveName, setSaveName] = useState('');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
  const [importedGameData, setImportedGameData] = useState<IGame | null>(null);

  const storageService = new LocalStorageService();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSavedGamesList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSavedGamesList = () => {
    const games = getSavedGamesList(storageService);
    setSavedGames(games);
  };

  const isValidSaveName = (name: string): boolean => {
    const trimmedName = name.trim();
    return (
      trimmedName.length > 0 && trimmedName.toLowerCase() !== AutoSaveGameSaveName.toLowerCase()
    );
  };

  const handleSaveGame = () => {
    if (gameState && saveName) {
      if (!isValidSaveName(saveName)) {
        showAlert(
          'Reserved save name.',
          `Reserved save name. Please enter a valid name that is not "${AutoSaveGameSaveName}".`
        );
        return;
      }
      if (selectedGameId && selectedGameId === AutoSaveGameSaveName) {
        showAlert(
          `Cannot overwrite ${AutoSaveGameSaveName}`,
          `Cannot overwrite the ${AutoSaveGameSaveName} game.`
        );
        return;
      }
      if (selectedGameId) {
        // If a game is selected, prompt for overwrite
        setOpenOverwriteDialog(true);
      } else {
        // If no game is selected, save as a new game
        setGameState((prevGame) => {
          const newGame = deepClone<IGame>(prevGame);
          const result = saveGame(newGame, saveName, storageService); // Pass storageService
          if (!result) {
            showAlert('Failed to save game', 'An error occurred while saving the game.');
            return prevGame;
          } else {
            setSaveName('');
            loadSavedGamesList();
          }
          return newGame;
        });
      }
    }
  };

  const handleSaveOverwrite = () => {
    if (gameState && saveName && selectedGameId) {
      setGameState((prevGame) => {
        const newGame = deepClone<IGame>(prevGame);
        const result = saveGame(newGame, saveName, storageService, selectedGameId);
        setOpenOverwriteDialog(false);
        if (!result) {
          showAlert('Failed to save game', 'An error occurred while saving the game.');
          return prevGame;
        } else {
          setSaveName('');
          setSelectedGameId(null);
          loadSavedGamesList();
          showAlert('Game saved', 'The game has been successfully saved.');
        }
        return newGame;
      });
    }
  };

  const handleImportOverwrite = () => {
    if (importedGameData && saveName && selectedGameId) {
      const result = saveGame(importedGameData, saveName, storageService, selectedGameId);
      setOpenOverwriteDialog(false);
      if (!result) {
        showAlert('Failed to import game', 'An error occurred while importing the game.');
      } else {
        setSaveName('');
        setSelectedGameId(null);
        setImportedGameData(null);
        loadSavedGamesList();
        showAlert('Game imported', 'The game has been successfully imported.');
      }
    }
  };

  const handleLoadGame = () => {
    if (selectedGameId) {
      if (gameState.currentStep === CurrentStep.Game) {
        setOpenDialog(true);
      } else {
        loadGameById(selectedGameId);
      }
    }
  };

  const loadGameById = (id: string) => {
    setGameState((prevGame) => {
      const loadedGame = loadGame(id, storageService, new Date());
      if (loadedGame) {
        setSelectedGameId(null);
        return loadedGame;
      } else {
        showAlert('Failed to load game', 'An error occurred while loading the game.');
        return prevGame;
      }
    });
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleConfirmLoad = () => {
    setOpenDialog(false);
    if (selectedGameId) {
      loadGameById(selectedGameId);
    }
  };

  const handleDeleteGame = (id: string) => {
    deleteSavedGame(id, storageService);
    loadSavedGamesList();
    if (selectedGameId === id) {
      setSelectedGameId(null);
    }
  };

  const handleSelectGame = (game: ISavedGameMetadata) => {
    setSelectedGameId(game.id);
    if (game.name !== AutoSaveGameSaveName) {
      setSaveName(game.name);
    }
  };

  const handleExport = () => {
    if (!selectedGameId) {
      return;
    }
    let saveGameName = saveName;
    if (!saveGameName && selectedGameId === AutoSaveGameSaveName) {
      saveGameName = AutoSaveGameSaveName;
    }

    const saveGameJson = loadGameJsonFromStorage(selectedGameId, storageService);
    if (saveGameJson) {
      const blob = new Blob([saveGameJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${saveGameName}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleImportGame = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedGame = JSON.parse(e.target?.result as string) as IGameRaw;
          const restoredGame = restoreSavedGame(importedGame);
          const gameName = file.name.replace('.json', '');

          // Check if a game with this name already exists
          const existingGame = savedGames.find((game) => game.name === gameName);

          if (existingGame) {
            // If the game exists, set the selected game and open the overwrite dialog
            setSelectedGameId(existingGame.id);
            setSaveName(gameName);
            setImportedGameData(restoredGame);
            setOpenOverwriteDialog(true);
          } else {
            // If the game doesn't exist, save it directly
            const result = saveGame(restoredGame, gameName, storageService);
            if (result) {
              showAlert('Game imported', 'The game has been successfully imported.');
              loadSavedGamesList();
            } else {
              showAlert('Import failed', 'Failed to import the game. Please try again.');
            }
          }
        } catch (error) {
          console.error('Error importing game:', error);
          if (error instanceof IncompatibleSaveError) {
            showAlert(
              'Import failed',
              'The selected file is from an earlier incomaptible version.'
            );
          } else {
            showAlert('Import failed', 'The selected file is not a valid game save.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const isGameActive = gameState.currentStep === CurrentStep.Game;
  const isGameOver = gameState.currentStep === CurrentStep.EndGame;
  const canSave = isGameActive || isGameOver;

  return (
    <Box sx={{ width: '100%', maxWidth: 600, margin: 'auto', p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Save Current Game
      </Typography>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="Enter save name"
          disabled={!canSave}
          fullWidth
          sx={{ mr: 1 }}
        />
        <IconButton
          onClick={handleSaveGame}
          color="primary"
          disabled={!gameState || !saveName || !canSave || !isValidSaveName(saveName)}
        >
          <SaveIcon />
        </IconButton>
      </Box>

      <Typography variant="h5" gutterBottom>
        Saved Games
      </Typography>
      <List>
        {savedGames.map((game) => (
          <ListItem
            key={game.id}
            disablePadding
            secondaryAction={
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteGame(game.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemButton
              selected={selectedGameId === game.id}
              onClick={() => {
                handleSelectGame(game);
              }}
            >
              <ListItemText
                primary={game.name}
                secondary={new Date(game.savedAt).toLocaleString()}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLoadGame}
            disabled={!selectedGameId}
            startIcon={<ArrowRightIcon />}
          >
            Load
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleExport}
            disabled={!selectedGameId}
            startIcon={<SaveAltIcon />}
          >
            Export
          </Button>
        </Box>

        <Box>
          <input
            type="file"
            accept=".json"
            onChange={handleImportGame}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={() => fileInputRef.current?.click()}
            startIcon={<UploadIcon />}
          >
            Import Game
          </Button>
        </Box>
      </Box>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>Load Game</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to load this game? Your current game progress will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleConfirmLoad} autoFocus>
            Load
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openOverwriteDialog}
        onClose={() => {
          setOpenOverwriteDialog(false);
        }}
      >
        <DialogTitle>Overwrite Game</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to overwrite the existing game?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenOverwriteDialog(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={importedGameData ? handleImportOverwrite : handleSaveOverwrite}
            autoFocus
          >
            Overwrite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoadSaveGame;
