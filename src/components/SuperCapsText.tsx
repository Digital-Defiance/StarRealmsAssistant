import React, { forwardRef } from 'react';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { TypographyProps } from '@mui/material/Typography';

interface SuperCapsSpanProps extends TypographyProps {
  sx?: object;
}

const SmallCapsSpan = styled(Typography)<SuperCapsSpanProps>(() => ({
  fontVariantCaps: 'small-caps',
  display: 'inline-block',
  fontFamily: 'Handel Gothic ITC Pro',
  lineHeight: 1,
}));

const SuperCapsText = forwardRef<HTMLSpanElement, SuperCapsSpanProps>(
  ({ children, sx, ...props }, ref) => {
    if (typeof children !== 'string') {
      return null;
    }

    return (
      <SmallCapsSpan
        ref={ref}
        component="span"
        {...props}
        sx={{
          ...sx,
        }}
      >
        {children}
      </SmallCapsSpan>
    );
  }
);

SuperCapsText.displayName = 'SuperCapsText';

export default SuperCapsText;
