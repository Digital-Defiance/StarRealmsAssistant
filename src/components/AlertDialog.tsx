import React, { FC } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useAlert } from '@/components/AlertContext';

const AlertDialog: FC = () => {
  const { alert, hideAlert } = useAlert();

  if (!alert) return null;

  return (
    <Dialog
      open={!!alert}
      onClose={hideAlert}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{alert.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{alert.message}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={hideAlert} color="primary" autoFocus>
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;
