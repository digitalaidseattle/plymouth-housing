import React, { useState } from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';
import { CategoryProps } from '../../types/interfaces';

interface SearchBarProps {
  data: CategoryProps[];
  setSearchData: (s: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ data, setSearchData }) => {

  const [searchTerm, setSearchTerm] = useState<string>('');

  return (
    <TextField
      variant="standard"
      placeholder={'Search...'}
      type="search"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
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
