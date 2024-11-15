import React, {
  useEffect,
  useRef,
  useState,
  memo,
  CSSProperties,
  RefObject,
  FC,
  useCallback,
} from 'react';
import { Paper, TableContainer, Typography, Box, Dialog, DialogContent } from '@mui/material';
import { useGameContext } from '@/components/GameContext';
import GameLogEntry from '@/components/GameLogEntry';
import TabTitle from '@/components/TabTitle';
import { CurrentStep } from '@/game/enumerations/current-step';
import TurnAdjustmentsSummary from '@/components/TurnAdjustments';
import { FixedSizeList } from 'react-window';
import { TabViewHandle } from '@/components/TabView';

interface GameLogProps {
  tabViewRef: RefObject<TabViewHandle>;
}

const MemoizedGameLogEntry = memo(GameLogEntry);

const GameLog: FC<GameLogProps> = ({ tabViewRef }) => {
  const { gameState } = useGameContext();
  const [openTurnAdjustmentsDialog, setOpenTurnAdjustmentsDialog] = useState(false);
  const [selectedTurn, setSelectedTurn] = useState<number | null>(null);
  const [listHeight, setListHeight] = useState<number>(window.innerHeight);
  const [listWidth, setListWidth] = useState<number>(window.innerWidth);
  const [dialogHeight, setDialogHeight] = useState<number>(0);
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<FixedSizeList>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollToItem(gameState.log.length - 1, 'end');
    }
  }, [gameState.log.length]);

  const calculateDialogHeight = () => {
    return window.innerHeight * 0.8; // 80% of the window height
  };

  const updateDialogHeight = useCallback(() => {
    setDialogHeight(calculateDialogHeight());
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const headerHeight = headerRef.current?.getBoundingClientRect().height ?? 0;
      const tabBarHeight = tabViewRef.current?.tabBar?.getBoundingClientRect().height ?? 0;
      const headerStyles = window.getComputedStyle(
        headerRef.current || document.createElement('div')
      );
      const headerMargin =
        parseFloat(headerStyles.marginTop) + parseFloat(headerStyles.marginBottom);
      const headerPadding =
        parseFloat(headerStyles.paddingTop) + parseFloat(headerStyles.paddingBottom);
      const headerBorder =
        parseFloat(headerStyles.borderTopWidth) + parseFloat(headerStyles.borderBottomWidth);
      const totalHeaderHeight = headerHeight + headerMargin + headerPadding + headerBorder;
      setListHeight(window.innerHeight - totalHeaderHeight - tabBarHeight - 16);
      setListWidth(window.innerWidth);
      updateDialogHeight();
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial height

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [tabViewRef, updateDialogHeight]);

  const handleOpenTurnAdjustmentsDialog = (turn: number) => {
    setSelectedTurn(turn);
    setOpenTurnAdjustmentsDialog(true);
    updateDialogHeight();
  };

  const handleCloseTurnAdjustmentsDialog = () => {
    setOpenTurnAdjustmentsDialog(false);
    setSelectedTurn(null);
  };

  const Row = ({ index, style }: { index: number; style: CSSProperties }) => (
    <div style={style}>
      <MemoizedGameLogEntry
        key={gameState.log[index].id}
        logIndex={index}
        entry={gameState.log[index]}
        onOpenTurnAdjustmentsDialog={handleOpenTurnAdjustmentsDialog}
      />
    </div>
  );

  return (
    <>
      <Box
        ref={headerRef}
        display="flex"
        justifyContent="center"
        sx={{ paddingTop: 4, boxSizing: 'border-box' }}
      >
        <TabTitle>Game Log</TabTitle>
      </Box>
      {gameState.currentStep === CurrentStep.Game ||
      gameState.currentStep === CurrentStep.EndGame ? (
        <TableContainer component={Paper} sx={{ width: '100%', height: '100%' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '15% 15% 60%', fontWeight: 'bold' }}>
            <Box>Date</Box>
            <Box>Game Time</Box>
            <Box>Action</Box>
          </Box>
          <FixedSizeList
            ref={listRef}
            height={listHeight}
            width={listWidth}
            itemCount={gameState.log.length}
            itemSize={35}
            style={{ width: '100%' }}
          >
            {Row}
          </FixedSizeList>
        </TableContainer>
      ) : (
        <Typography variant="body1" color="textSecondary" align="center" style={{ marginTop: 20 }}>
          The game has not started yet.
        </Typography>
      )}
      <Dialog
        open={openTurnAdjustmentsDialog}
        onClose={handleCloseTurnAdjustmentsDialog}
        aria-labelledby="turn-adjustments-dialog-title"
        maxWidth="md" // Adjust this as needed
        fullWidth
      >
        <DialogContent sx={{ height: dialogHeight, overflow: 'auto' }}>
          {selectedTurn !== null && (
            <TurnAdjustmentsSummary turn={selectedTurn} containerHeight={dialogHeight} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GameLog;
