import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search } from '@mui/icons-material';

interface SearchBarProps {
  placeholder?: string;
  onSearchChange?: (value: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ placeholder, onSearchChange }) => {
  return (
    <TextField
      variant="standard"
      placeholder={placeholder || 'Search...'}
      type="search"
      onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
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
