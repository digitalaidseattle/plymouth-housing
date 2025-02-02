import React, { useRef, useState } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { CategoryProps } from '../../types/interfaces';

interface SearchBarProps {
  data: CategoryProps[];
  setSearchData: React.Dispatch<React.SetStateAction<CategoryProps[]>>;
  setSearchActive: (arg0: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ data, setSearchData, setSearchActive }) => {

  const [searchTerm, setSearchTerm] = useState<string>('');

  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  const searchChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      setSearchActive(true)
    } else {
      setSearchActive(false);
    }
    setSearchTerm(e.target.value);

    // Clear the existing timeout if typing continues
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    // Set a new timeout to call the filterFunction after 500ms
    timeoutId.current = setTimeout(() => {
      filterFunction(e.target.value);
    }, 500); // 500ms debounce delay
  };

  const filterFunction = (term: string) => {
    const filteredItems = data.map((category) => {
      const filteredCategoryItems = category.items.filter((item) => {
        const searchTermLower = term.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchTermLower) ||
          item.description.toLowerCase().includes(searchTermLower)
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
      value={searchTerm}
      onChange={searchChangeHandler}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search />
          </InputAdornment>
        ),
      }}
    />
  );
};

export default SearchBar;
