import { CategoryProps } from '../../types/interfaces'
import { Box, Button} from '@mui/material';

type dataProps = {
  filteredData: CategoryProps[];
  scrollToCategory: (id: string) => void;
}

const Navbar = ({ filteredData, scrollToCategory }: dataProps) => {

  return (
    <Box
      sx={{
        position: 'sticky', 
        top: 0, 
        height: '64px', 
        zIndex: 2002,
        background: 'white',
        display: 'flex',
        overflowX: 'auto',
        gap: 2,
        whiteSpace: 'nowrap',
      }}
    >
      <Button onClick={() => scrollToCategory('Welcome Basket')} sx={{ color: 'black' }}>
          Welcome Basket
        </Button>
      {filteredData.map((categories) => (
        <Button key={categories.category} onClick={() => scrollToCategory(categories.category)} sx={{ color: 'black' }}>
          {categories.category}
        </Button>
      ))}
    </Box>
  )
}

export default Navbar