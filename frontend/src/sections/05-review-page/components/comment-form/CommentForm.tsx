import styled from 'styled-components';
import { useState } from 'react';
import { commentStore } from '../../../../store/commentStore';
import { useVideoStore } from '../../../../store/videoStore';
import { useTimecode } from '../../../../store/timeCodeStore';

export const CommentForm = () => {
  const incrementMarkerTrigger = useVideoStore((state) => state.incrementMarkerTrigger);
  const [text, setText] = useState('');
  const addMessage = commentStore((state) => state.addMessage);
  const timecode = useTimecode((state) => state.timecode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    addMessage({
      id: Date.now(),
      projectID: projectId,
      message: text,
      createdAt: new Date(),
      timeStamp: timecode
    });

    setText('');
    incrementMarkerTrigger();
  };

  return (
    <Container as="form" onSubmit={handleSubmit}>
      <TextInput
        type="text"
        placeholder="Leave your comment here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <Footer>
        <TimeTag>
          <p>{timecode}</p>
          <input type="checkbox" />
        </TimeTag>

        <Select name="Teacher">
          <option value="question">Question</option>
          <option value="comment">Comment</option>
        </Select>

        <SendButton type="submit">Send</SendButton>
      </Footer>
    </Container>
  );
};

const Container = styled.div`
  position: sticky;
  bottom: 16px;
  width: 95%;
  margin: 0 auto;
  padding: 12px;
  border-radius: 12px;
  background-color: #a8bbd1;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const TextInput = styled.input`
  height: 48px;
  padding: 10px;
  font-size: 16px;
  border: none;
  border-radius: 8px;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
`;

const TimeTag = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  p {
    font-size: 14px;
    color: #333;
    margin: 0;
  }

  input {
    width: 16px;
    height: 16px;
  }
`;

const Select = styled.select`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
  background-color: white;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const SendButton = styled.button`
  padding: 8px 16px;
  background-color: #007bff;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #0056b3;
  }
`;