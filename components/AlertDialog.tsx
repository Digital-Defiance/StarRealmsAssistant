import React, { useEffect } from 'react';
import { Platform, Alert } from 'react-native';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';
import { useAlert } from '@/components/AlertContext';

const AlertDialog: React.FC = () => {
  const { alert, hideAlert } = useAlert();

  useEffect(() => {
    if (alert && Platform.OS !== 'web') {
      Alert.alert(alert.title, alert.message, [{ text: 'OK', onPress: hideAlert }]);
    }
  }, [alert, hideAlert]);

  if (!alert) return null;

  if (Platform.OS === 'web') {
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
  }

  return null;
};

export default AlertDialog;
