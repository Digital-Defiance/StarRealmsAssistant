import React, { useState, useEffect } from 'react';
import { useGameContext } from '@/components/GameContext';
import {
  saveGame,
  loadGame,
  getSavedGamesList,
  deleteSavedGame,
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
import { ArrowRight as ArrowRightIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { CurrentStep } from '@/game/enumerations/current-step';
import { useAlert } from '@/components/AlertContext';
import { LocalStorageService } from '@/game/local-storage-service';

const LoadSaveGame: React.FC = () => {
  const { showAlert } = useAlert();
  const [openDialog, setOpenDialog] = useState(false);
  const [openOverwriteDialog, setOpenOverwriteDialog] = useState(false);
  const { gameState, setGameState } = useGameContext();
  const [savedGames, setSavedGames] = useState<ISavedGameMetadata[]>([]);
  const [saveName, setSaveName] = useState('');
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  const storageService = new LocalStorageService(); // Create an instance of the storage service

  useEffect(() => {
    loadSavedGamesList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSavedGamesList = () => {
    const games = getSavedGamesList(storageService); // Pass storageService
    setSavedGames(games);
  };

  const handleSaveGame = () => {
    if (gameState && saveName) {
      if (selectedGameId) {
        // If a game is selected, prompt for overwrite
        setOpenOverwriteDialog(true);
      } else {
        // If no game is selected, save as a new game
        setGameState((prevGame) => {
          const result = saveGame(prevGame, saveName, storageService); // Pass storageService
          if (!result) {
            showAlert('Failed to save game', 'An error occurred while saving the game.');
          } else {
            setSaveName('');
            loadSavedGamesList();
          }
          return prevGame;
        });
      }
    }
  };

  const handleOverwriteConfirm = () => {
    if (gameState && saveName && selectedGameId) {
      setGameState((prevGame) => {
        const result = saveGame(prevGame, saveName, storageService, selectedGameId); // Pass storageService
        setOpenOverwriteDialog(false);
        if (!result) {
          showAlert('Failed to save game', 'An error occurred while saving the game.');
        } else {
          setSaveName('');
          setSelectedGameId(null);
          loadSavedGamesList();
        }
        return prevGame;
      });
    }
  };

  const handleLoadGame = () => {
    if (selectedGameId) {
      if (gameState.currentStep === CurrentStep.GameScreen) {
        setOpenDialog(true);
      } else {
        loadGameById(selectedGameId);
      }
    }
  };

  const loadGameById = (id: string) => {
    setGameState((prevGame) => {
      const loadedGame = loadGame(id, storageService); // Pass storageService
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
    deleteSavedGame(id, storageService); // Pass storageService
    loadSavedGamesList();
    if (selectedGameId === id) {
      setSelectedGameId(null);
    }
  };

  const handleSelectGame = (game: ISavedGameMetadata) => {
    setSelectedGameId(game.id);
    setSaveName(game.name);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Save Current Game
      </Typography>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder="Enter save name"
          fullWidth
          sx={{ mr: 1 }}
        />
        <Button variant="contained" onClick={handleSaveGame} disabled={!gameState || !saveName}>
          Save Game
        </Button>
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
              onClick={() => handleSelectGame(game)}
            >
              <ListItemText
                primary={game.name}
                secondary={new Date(game.savedAt).toLocaleString()}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Button
        variant="contained"
        onClick={handleLoadGame}
        disabled={!selectedGameId}
        startIcon={<ArrowRightIcon />}
        sx={{ mt: 2 }}
      >
        Load Selected Game
      </Button>
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{'Game in Progress'}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to load a new game? Your current game progress will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button onClick={handleConfirmLoad} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openOverwriteDialog} onClose={() => setOpenOverwriteDialog(false)}>
        <DialogTitle>Confirm Overwrite</DialogTitle>
        <DialogContent>
          <DialogContentText>
            A game with this name already exists. Do you want to overwrite it?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOverwriteDialog(false)}>Cancel</Button>
          <Button onClick={handleOverwriteConfirm} autoFocus>
            Overwrite
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoadSaveGame;
