/*
 * Copyright (c) 2026 Steffen Blake
 * Licensed under the MIT License. See LICENSE file in the project root.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
 */

import { useState, useEffect, useRef } from 'preact/hooks';
import Fuse from 'fuse.js';
import { LoadingSpinner } from './LoadingSpinner';

/**
 * Highlights matched characters in the text based on Fuse.js match indices
 * @param {string} text - The text to highlight
 * @param {Array} indices - Array of [start, end] indices from Fuse.js matches
 * @returns {JSX.Element} Text with highlighted matches
 */
function HighlightedText({ text, indices = [] }) {
  if (!indices || indices.length === 0) {
    return <span>{text}</span>;
  }

  const parts = [];
  let lastIndex = 0;

  // Merge overlapping indices and sort by start position
  const mergedIndices = [];
  const sortedIndices = [...indices].sort((a, b) => a[0] - b[0]);
  
  sortedIndices.forEach(([start, end]) => {
    if (mergedIndices.length === 0) {
      mergedIndices.push([start, end]);
    } else {
      const last = mergedIndices[mergedIndices.length - 1];
      // If current range overlaps or touches the last range, merge them
      if (start <= last[1] + 1) {
        last[1] = Math.max(last[1], end);
      } else {
        mergedIndices.push([start, end]);
      }
    }
  });

  mergedIndices.forEach(([start, end], index) => {
    // Add text before the match
    if (start > lastIndex) {
      parts.push(
        <span key={`text-${lastIndex}-${index}`}>{text.substring(lastIndex, start)}</span>
      );
    }
    // Add highlighted match
    parts.push(
      <mark key={`match-${start}-${index}`} className="fuzzy-match">
        {text.substring(start, end + 1)}
      </mark>
    );
    lastIndex = end + 1;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(
      <span key={`text-${lastIndex}-end`}>{text.substring(lastIndex)}</span>
    );
  }

  return <span>{parts}</span>;
}

/**
 * FuzzyDropdown component with search and highlighting
 * @param {object} props
 * @param {string} props.value - Current selected value
 * @param {Function} props.onChange - Callback when selection changes
 * @param {Array} props.options - Array of options {value, label, searchableText}
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.isLoading - Loading state
 * @param {Error} props.error - Error object
 * @param {boolean} props.disabled - Disabled state
 * @param {string} props.className - CSS class name
 */
export function FuzzyDropdown({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  isLoading = false,
  error = null,
  disabled = false,
  className = '',
}) {
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize Fuse.js for fuzzy search
  const fuse = useRef(null);
  useEffect(() => {
    if (options.length > 0) {
      fuse.current = new Fuse(options, {
        keys: ['searchableText', 'label'],
        threshold: 0.6, // Higher = more fuzzy (0.0 = perfect match, 1.0 = match anything)
        distance: 100, // Maximum distance between characters
        includeScore: true,
        includeMatches: true,
        minMatchCharLength: 1,
        ignoreLocation: true, // Don't weight matches by position
        useExtendedSearch: false,
        findAllMatches: true, // Find all matching characters
      });
    }
  }, [options]);

  // Filter options based on search text
  const filteredOptions = searchText.trim() === '' 
    ? options.map((opt, index) => ({ item: opt, refIndex: index }))
    : fuse.current ? fuse.current.search(searchText) : [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchText('');
        setHighlightedIndex(-1);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset highlighted index when dropdown opens/closes
  useEffect(() => {
    if (!isOpen) {
      setHighlightedIndex(-1);
    } else {
      // Set to 0 when dropdown opens
      setHighlightedIndex(0);
      // Focus the input when dropdown opens
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => 
          prev < filteredOptions.length - 1 ? prev + 1 : filteredOptions.length - 1
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          const selected = filteredOptions[highlightedIndex].item;
          onChange(selected.value);
          setIsOpen(false);
          setSearchText('');
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSearchText('');
        break;
    }
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchText('');
  };

  // Get display text for selected value
  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  // Get all match indices for an option - only from the 'label' field
  const getMatchIndices = (result) => {
    if (!result.matches || result.matches.length === 0) return [];
    
    // Only get indices from the 'label' field match
    const labelMatch = result.matches.find((match) => match.key === 'label');
    if (labelMatch && labelMatch.indices) {
      return labelMatch.indices;
    }
    return [];
  };

  const isDisabled = disabled || isLoading;

  return (
    <div className={`fuzzy-dropdown ${className}`} ref={dropdownRef}>
      <div
        className={`fuzzy-dropdown-control ${isOpen ? 'open' : ''} ${isDisabled ? 'disabled' : ''}`}
        onClick={() => !isDisabled && setIsOpen(!isOpen)}
        tabIndex={isDisabled ? -1 : 0}
        onKeyDown={handleKeyDown}
      >
        {isLoading ? (
          <div className="fuzzy-dropdown-loading">
            <LoadingSpinner text="Loading" />
          </div>
        ) : error ? (
          <div className="fuzzy-dropdown-error">
            {'\uf071'} Error: {error.message}
          </div>
        ) : (
          <>
            {isOpen ? (
              <input
                ref={inputRef}
                type="text"
                className="fuzzy-dropdown-input"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={(e) => {
                  e.stopPropagation(); // Prevent double-firing from parent control
                  handleKeyDown(e);
                }}
                onClick={(e) => e.stopPropagation()} // Prevent control's onClick from closing dropdown
                placeholder="Type to search..."
                autoFocus
              />
            ) : (
              <span className="fuzzy-dropdown-text">{displayText}</span>
            )}
            <span className="fuzzy-dropdown-arrow">{isOpen ? '\uf0d8' : '\uf0d7'}</span>
          </>
        )}
      </div>

      {isOpen && !isLoading && !error && (
        <div className="fuzzy-dropdown-menu">
          {filteredOptions.length === 0 ? (
            <div className="fuzzy-dropdown-no-results">No results found</div>
          ) : (
            <ul className="fuzzy-dropdown-list">
              {filteredOptions.map((result, index) => {
                const option = result.item;
                const indices = getMatchIndices(result);
                const isHighlighted = index === highlightedIndex;
                const isSelected = option.value === value;

                return (
                  <li
                    key={option.value}
                    className={`fuzzy-dropdown-option ${isHighlighted ? 'highlighted' : ''} ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(option.value)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    <HighlightedText text={option.label} indices={indices} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
