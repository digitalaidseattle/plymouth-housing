import React, { useState } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search, Close } from '@mui/icons-material';
import { CategoryProps } from '../types/interfaces';

interface SearchBarProps {
  data?: CategoryProps[];
  setSearchData?: React.Dispatch<React.SetStateAction<CategoryProps[]>>;
  setSearchActive?: (arg0: boolean) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  placeholder?: string;
  width?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  data, 
  setSearchData, 
  setSearchActive, 
  searchValue, 
  onSearchChange,
  placeholder = 'Search...',
  width = '30%'
}) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState<string>('');
  
  // Use searchValue as search term for generic search and use 
  const searchTerm = searchValue !== undefined ? searchValue : internalSearchTerm;

  const searchChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // For checkout page functionality
    if (setSearchActive) {
      setSearchActive(!!newValue);
    }
    
    // Manipulate the search term here if searchValue is not provided
    if (searchValue === undefined) {
      setInternalSearchTerm(newValue);
    }
    
    // Handle callback for parent controlled component
    if (onSearchChange) {
      onSearchChange(newValue);
    }
    
    // Handle checkout page filtering
    if (data && setSearchData) {
      filterFunction(newValue);
      // reset scroll position for checkout page
      window.scrollTo(0, 0);
    }
  };

  const filterFunction = (term: string) => {
    if (!data || !setSearchData) return;
    
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

    setSearchData(filteredItems);
  };

  const clearSearch = () => {
    if (searchValue === undefined) {
      setInternalSearchTerm('');
    }
    
    if (onSearchChange) {
      onSearchChange('');
    }
    
    if (setSearchActive) {
      setSearchActive(false);
    }
  };

  return (
    <TextField
      variant="standard"
      placeholder={placeholder}
      type="search" 
      sx={{'input[type="search"]::-webkit-search-cancel-button ': {display: 'none'}, width: width}}
      value={searchTerm}
      onChange={searchChangeHandler}
      inputProps={{ sx: { fontSize: { xs: '24px', md: '20px', lg: '16px'} } }}
      InputLabelProps={{ sx: { xs: '24px', md: '20px', lg: '16px'}}}
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
                visibility: searchTerm ? 'visible' : 'hidden',
              }}
              onClick={clearSearch}
            />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;