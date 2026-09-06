/**
 *  PanelCard.tsx
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { Card, CardContent } from '@mui/material';

interface PanelCardProps {
  children: React.ReactNode;
  fullHeight?: boolean;
}

const PanelCard: React.FC<PanelCardProps> = ({ children, fullHeight }) => (
  <Card
    variant="outlined"
    sx={{
      borderColor: 'grey.300',
      borderRadius: 3,
      ...(fullHeight && { height: '100%' }),
    }}
  >
    <CardContent sx={{ p: 3 }}>{children}</CardContent>
  </Card>
);

export default PanelCard;
