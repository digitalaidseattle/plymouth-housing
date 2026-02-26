import { CategoryProps } from '../../types/interfaces'
import { Box, Button } from '@mui/material';

type dataProps = {
  filteredData: CategoryProps[];
  scrollToCategory: (id: string) => void;
}

const Navbar = ({ filteredData, scrollToCategory }: dataProps) => {
  const hasWelcomeBasket = filteredData.some((category) => category.category === 'Welcome Basket');

  return (
    <Box
      sx={{
        display: 'flex',
        overflowX: 'auto',
        gap: 2,
        whiteSpace: 'nowrap',
      }}
    >
      {hasWelcomeBasket && (
        <Button onClick={() => scrollToCategory('Welcome Basket')} sx={{ color: 'black', minWidth: 'auto' }}>
          Welcome Basket
        </Button>
      )}
      {filteredData.map((categories) => (
        <Button key={categories.category} onClick={() => scrollToCategory(categories.category)} sx={{ color: 'black',  minWidth: 'auto' }}>
          {categories.category}
        </Button>
      ))}
    </Box>
  )
}

export default Navbar;