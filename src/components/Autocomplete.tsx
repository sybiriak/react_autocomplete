import './Autocomplete.scss';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { peopleFromServer } from '../data/people';
import classNames from 'classnames';
import { Person } from '../types/Person';

function useOutsideAlerter(
  ref: React.MutableRefObject<HTMLElement | null>,
  callback: () => void,
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, callback]);
}

type Props = {
  delay?: number;
  onSelect: (person: Person | null) => void;
};

export const Autocomplete: React.FC<Props> = ({ delay = 300, onSelect }) => {
  const [isActive, setIsActive] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [normalizedQuery, setNormalizedQuery] = useState<string>('');

  const timerId = useRef(0);
  const wrapperRef = useRef(null);

  useOutsideAlerter(wrapperRef, () => {
    setIsActive(false);
  });

  function saveQuery(newQuery: string) {
    setQuery(newQuery);
    onSelect(null);

    window.clearTimeout(timerId.current);

    timerId.current = window.setTimeout(() => {
      setNormalizedQuery(newQuery.trim().toLowerCase());
    }, delay);
  }

  function handleSelect(person: Person) {
    setQuery(person.name);
    onSelect(person);
    setIsActive(false);
  }

  const filteredPeople = useMemo(() => {
    return peopleFromServer.filter(person =>
      person.name.toLowerCase().includes(normalizedQuery),
    );
  }, [normalizedQuery]);

  return (
    <>
      <div
        className={classNames('dropdown', { 'is-active': isActive })}
        ref={wrapperRef}
      >
        <div className="dropdown-trigger">
          <input
            type="text"
            placeholder="Enter a part of the name"
            className="input"
            data-cy="search-input"
            value={query}
            onFocus={() => setIsActive(true)}
            onChange={event => saveQuery(event.target.value)}
          />
        </div>

        <div className="dropdown-menu" role="menu" data-cy="suggestions-list">
          <div className="dropdown-content">
            {filteredPeople.map(person => (
              <div
                key={person.name}
                className="dropdown-item"
                data-cy="suggestion-item"
                onClick={() => handleSelect(person)}
              >
                <p className="has-text-link">{person.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {!filteredPeople.length && (
        <div
          className="
              notification
              is-danger
              is-light
              mt-3
              is-align-self-flex-start
            "
          role="alert"
          data-cy="no-suggestions-message"
        >
          <p className="has-text-danger">No matching suggestions</p>
        </div>
      )}
    </>
  );
};
