import { ReactNode, forwardRef } from 'react';

// material-ui
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// project import

// header style
const headerSX = {
  p: 2.5,
  '& .MuiCardHeader-action': { m: '0px auto', alignSelf: 'center' }
};

// ==============================|| CUSTOM - MAIN CARD ||============================== //

export interface MainCardProp {
  border?: boolean,
  boxShadow?: boolean,
  contentSX?: object,
  darkTitle?: boolean,
  divider?: boolean,
  elevation?: number,
  secondary?: ReactNode,
  shadow?: string,
  sx?: object,
  title?: string | ReactNode,
  codeHighlight?: boolean,
  content?: boolean,
  children?: ReactNode
}

const MainCard: React.FC<MainCardProp> = forwardRef(
  (
    {
      border = true,
      boxShadow,
      children,
      content = true,
      contentSX = {},
      darkTitle,
      elevation,
      secondary,
      shadow,
      sx = {},
      title,
      ...others
    },
    ref
  ) => {
    const theme = useTheme();
    boxShadow = theme.palette.mode === 'dark' ? boxShadow || true : boxShadow;

    return (
      <Card
        elevation={elevation || 0}
        // FIXME
        // eslint-disable-next-line 
        ref={ref as any}
        {...others}
        sx={{
          border: border ? '1px solid' : 'none',
          borderRadius: 2,
          borderColor: theme.palette.mode === 'dark' ? theme.palette.divider : theme.palette.grey.A700,
          boxShadow: boxShadow && (!border || theme.palette.mode === 'dark') ? shadow || theme.shadows[1] : 'inherit',
          ':hover': {
            boxShadow: boxShadow ? shadow || theme.shadows[1] : 'inherit'
          },
          '& pre': {
            m: 0,
            p: '16px !important',
            fontFamily: theme.typography.fontFamily,
            fontSize: '0.75rem'
          },
          ...sx
        }}
      >
        {/* card header and action */}
        {!darkTitle && title && (
          <CardHeader sx={headerSX} titleTypographyProps={{ variant: 'subtitle1' }} title={title} action={secondary} />
        )}
        {darkTitle && title && <CardHeader sx={headerSX} title={<Typography variant="h3">{title}</Typography>} action={secondary} />}

        {/* card content */}
        {content && <CardContent sx={contentSX}>{children}</CardContent>}
        {!content && children}
      </Card>
    );
  }
);


export default MainCard;
