import React, { forwardRef } from 'react';
import { Typography, TypographyProps } from '@mui/material';
import styled from '@emotion/styled';

interface SuperCapsSpanProps extends TypographyProps<'span'> {
  fontSize?: number;
}

const SmallCapsSpan = styled(Typography)<SuperCapsSpanProps>`
  font-variant-caps: small-caps;
  display: inline-block;
  font-family: 'CharlemagneStdBold';
  font-size: ${({ fontSize }) => (fontSize ? `${fontSize}px` : 'inherit')};
  line-height: 1;
`;

const SuperCapsText = forwardRef<HTMLSpanElement, SuperCapsSpanProps>(
  ({ children, fontSize = 24, ...props }, ref) => {
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
          ...props.sx,
        }}
      >
        {children}
      </SmallCapsSpan>
    );
  }
);

SuperCapsText.displayName = 'SuperCapsText';

export default SuperCapsText;
