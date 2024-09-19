import React, { useState, useRef } from 'react';

interface Tag {
  id: string;
  text: string;
  type: string;
}

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [cursorPos, setCursorPos] = useState<number | null>(null);
  const [focusedTagId, setFocusedTagId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const availableTags = ['HTML', 'CSS', 'JavaScript', 'React', 'Next.js', 'Tailwind'];

  const getDynamicInputWidth = (text: string) => {
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.whiteSpace = 'pre';
    span.style.fontFamily = 'inherit';
    span.style.fontSize = 'inherit';
    span.textContent = text || ' ';
    document.body.appendChild(span);

    const width = span.offsetWidth + 4; // Add padding for extra space
    document.body.removeChild(span); // Clean up the span

    return width;
  };

  const handleTagClick = (tagText: string) => {
    const newTag: Tag = { id: generateUniqueId(), text: tagText, type: 'tag' };

    if (focusedTagId !== null && cursorPos !== null) {
      setTags((prevTags) => {
        return prevTags.flatMap((tag) => {
          if (tag.id === focusedTagId && tag.type === 'text') {
            const isCloserToStart = cursorPos <= tag.text.length / 2;
            return isCloserToStart ? [newTag, tag] : [tag, newTag];
          }
          return tag;
        });
      });
      setFocusedTagId(null);
      setCursorPos(null);
    } else {
      if (inputValue.length !== 0) {
        const inputField: Tag = { id: generateUniqueId(), text: inputValue, type: 'text' };
        setTags((prevTags) => [...prevTags, inputField]);
        setInputValue('');
      }
      setTags((prevTags) => [...prevTags, newTag]);
    }

    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, id?: string) => {
    if (id !== undefined) {
      setTags((prevTags) =>
        prevTags.map((tag) => (tag.id === id ? { ...tag, text: e.target.value } : tag))
      );
    } else {
      setInputValue(e.target.value);
    }
  };

  const handleTagDelete = (id: string) => {
    setTags((prevTags) => prevTags.filter((tag) => tag.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, id?: string) => {
    if (e.key === 'Backspace') {
      if (id !== undefined) {
        const currentTag = tags.find((tag) => tag.id === id);
        if (currentTag && currentTag.text === '') {
          handleTagDelete(id);
        }
      } else if (inputValue === '') {
        if (tags.length > 0 && tags[tags.length - 1].type === 'tag') {
          handleTagDelete(tags[tags.length - 1].id);
        }
      }
    }
  };

  const handleCursorPosition = (id: string) => {
    setFocusedTagId(id);
  };

  const handleCursorUpdate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCursorPos(e.target.selectionStart);
  };

  return (
    <div className='flex flex-col items-center justify-center h-screen w-[60%] mx-auto'>
      <div className="flex flex-wrap mb-4 space-x-2">
        {availableTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full"
          >
            {tag}
          </button>
        ))}
      </div>
      <div className='flex flex-wrap gap-1 border p-2 rounded-md w-full'>
        {tags.map((tag) => (
          <>
            {tag.type === "tag" ? (
              <span
                key={tag.id}
                className="inline-flex items-center px-2 py-1 text-sm text-gray-600 bg-gray-200 rounded-full"
              >
                {tag.text}
                <button
                  type="button"
                  onClick={() => handleTagDelete(tag.id)}
                  className="ml-1 text-gray-500 hover:text-gray-700"
                >
                  &times;
                </button>
              </span>
            ) : (
              <div className="flex items-center">
                <input
                  type="text"
                  value={tag.text}
                  onChange={(e) => handleInputChange(e, tag.id)}
                  onFocus={() => handleCursorPosition(tag.id)}
                  onKeyDown={(e) => handleKeyDown(e, tag.id)}
                  onSelect={handleCursorUpdate}
                  className="focus:outline-none"
                  style={{
                    width: `${getDynamicInputWidth(tag.text)}px`,
                  }}
                />
              </div>
            )}
          </>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onSelect={handleCursorUpdate}
          ref={inputRef}
          placeholder="Type or select a tag..."
          className="focus:outline-none flex-1"
        />
      </div>
    </div>
  );
};

export default App;
