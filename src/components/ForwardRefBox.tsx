import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Box, BoxProps } from '@mui/material';

type ForwardRefBoxProps = BoxProps;

const ForwardRefBox = forwardRef<HTMLDivElement, ForwardRefBoxProps>((props, ref) => {
  const boxRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => boxRef.current as HTMLDivElement);

  return <Box ref={boxRef} {...props} />;
});

ForwardRefBox.displayName = 'ForwardRefBox';

export default ForwardRefBox;
