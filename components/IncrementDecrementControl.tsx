import React, { forwardRef } from 'react';
import { Box, Typography, IconButton, Tooltip, TooltipProps, TypographyProps } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { SUBTITLE_SIZE } from '@/components/style';

// Modify StyledTypography to use forwardRef
const StyledTypography = React.forwardRef<HTMLSpanElement, TypographyProps>((props, ref) => (
  <Typography
    ref={ref}
    {...props}
    sx={{
      fontFamily: 'TrajanProBold',
      fontSize: SUBTITLE_SIZE,
      ...props.sx,
    }}
  />
));

StyledTypography.displayName = 'StyledTypography';

// Similarly, update StyledLargeNumber
const StyledLargeNumber = React.forwardRef<HTMLSpanElement, TypographyProps>((props, ref) => (
  <Typography
    ref={ref}
    {...props}
    sx={{
      fontFamily: 'TrajanProBold',
      fontSize: SUBTITLE_SIZE,
      fontWeight: 'bold',
      ...props.sx,
    }}
  />
));

StyledLargeNumber.displayName = 'StyledLargeNumber';

interface IncrementDecrementControlProps {
  label: string;
  value: number;
  tooltip?: string;
  onIncrement: () => void;
  onDecrement: () => void;
  sx?: any;
  tooltipProps?: Omit<TooltipProps, 'children' | 'title'>;
}

const IncrementDecrementControl: React.FC<IncrementDecrementControlProps> = ({
  label,
  value,
  tooltip,
  onIncrement,
  onDecrement,
  tooltipProps,
  sx,
  ...otherProps
}) => {
  const labelContent = (
    <StyledTypography variant="body1" sx={{ marginRight: 1 }}>
      {label}:
    </StyledTypography>
  );

  return (
    <Box
      {...otherProps}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        width: '100%',
        ...sx,
      }}
    >
      {tooltip ? (
        <Tooltip title={tooltip} {...tooltipProps}>
          {labelContent}
        </Tooltip>
      ) : (
        labelContent
      )}
      <IconButton onClick={onDecrement} size="small">
        <RemoveIcon fontSize="small" />
      </IconButton>
      <StyledLargeNumber variant="body1" sx={{ minWidth: 20, textAlign: 'center' }}>
        {value}
      </StyledLargeNumber>
      <IconButton onClick={onIncrement} size="small">
        <AddIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

export default IncrementDecrementControl;
