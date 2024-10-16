import React, { forwardRef } from 'react';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import { TypographyProps } from '@mui/material/Typography';

interface SuperCapsSpanProps extends TypographyProps {
  fontSize?: number;
  sx?: object;
}

const SmallCapsSpan = styled(Typography)<SuperCapsSpanProps>(
  ({ fontSize }: { fontSize?: number }) => ({
    fontVariantCaps: 'small-caps',
    display: 'inline-block',
    fontFamily: 'CharlemagneStdBold',
    fontSize: fontSize ? `${fontSize}px` : 'inherit',
    lineHeight: 1,
  })
);

const SuperCapsText = forwardRef<HTMLSpanElement, SuperCapsSpanProps>(
  ({ children, fontSize = 24, sx, ...props }, ref) => {
    if (typeof children !== 'string') {
      return null;
    }

    return (
      <SmallCapsSpan
        ref={ref}
        component="span"
        fontSize={fontSize}
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
