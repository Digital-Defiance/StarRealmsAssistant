// SuperCapsText.tsx
import React, { forwardRef } from 'react';
import { Typography, TypographyProps } from '@mui/material';

interface SuperCapsTextProps extends TypographyProps<'span'> {
  fontSize?: number;
}

const SuperCapsText = forwardRef<HTMLSpanElement, SuperCapsTextProps>(
  ({ children, fontSize = 24, ...props }, ref) => {
    if (typeof children !== 'string') {
      return null;
    }

    const firstLetter = children.charAt(0);
    const restOfText = children.slice(1);

    return (
      <Typography
        ref={ref}
        component="span"
        {...props}
        sx={{
          display: 'inline-block',
          fontFamily: 'CharlemagneStdBold',
          fontSize: fontSize,
          lineHeight: 1,
          ...props.sx,
        }}
      >
        <span style={{ textTransform: 'uppercase', fontSize: '105%' }}>{firstLetter}</span>
        {restOfText}
      </Typography>
    );
  }
);

SuperCapsText.displayName = 'SuperCapsText';

export default SuperCapsText;
