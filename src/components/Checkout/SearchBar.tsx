import React, { useState } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search, Close } from '@mui/icons-material';
import { CategoryProps } from '../../types/interfaces';

interface SearchBarProps {
  data: CategoryProps[];
  setSearchData: React.Dispatch<React.SetStateAction<CategoryProps[]>>;
  setSearchActive: (arg0: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ data, setSearchData, setSearchActive }) => {

  const [searchTerm, setSearchTerm] = useState<string>('');

  const searchChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSearchActive(true)
    } else {
      setSearchActive(false);
    }
    setSearchTerm(e.target.value);
    filterFunction(e.target.value);
    // reset scroll position
    window.scrollTo(0, 0);
  };

  const filterFunction = (term: string) => {
    const filteredItems = data.map((category) => {
      const filteredCategoryItems = category.items.filter((item) => {
        const searchTermLower = term.toLowerCase();
        return (
          (item.name?.toLowerCase().includes(searchTermLower) || '') ||
          (item.description?.toLowerCase().includes(searchTermLower) || '')
        );
      });

      return {
        ...category,
        items: filteredCategoryItems,
      };
    }).filter((category) => category.items.length > 0);

    setSearchData(filteredItems)
  }

  return (
    <TextField
      variant="standard"
      placeholder={'Search...'}
      type="search" 
      sx={{'input[type="search"]::-webkit-search-cancel-button ': {display: 'none'}, width: '30%'}}
      value={searchTerm}
      onChange={searchChangeHandler}
      inputProps={{ sx: { fontSize: { xs: '24px', md: '20px', lg: '16px'} } }} // font size of input text
      InputLabelProps={{ sx: { xs: '24px', md: '20px', lg: '16px'}}} // font size of input label
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <Close
              style={{ 
                cursor: 'pointer',
                visibility: searchTerm ? 'visible' : 'hidden',}}
              onClick={() => {
                setSearchTerm('');
                setSearchActive(false);
              }}
            />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;
