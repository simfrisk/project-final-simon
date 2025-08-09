import styled from "styled-components";
import { CircleCheckboxLabel, HiddenCheckbox, StyledCircle } from "../../../../../global-components/checkbox";
import moment from "moment";

interface CommentCardHeaderProps {
  _id: string;
  commentCreatedBy?: {
    name?: string;
    profileImage?: string;
    role?: string;
  };
  createdAt?: string | Date;
  isChecked: boolean;
  user?: { role?: string } | null;
  handleToggleCheck: (id: string) => void;
}


export const CommentCardHeader: React.FC<CommentCardHeaderProps> = ({
  _id, 
  commentCreatedBy, 
  createdAt, 
  isChecked, 
  user, 
  handleToggleCheck}) => {
    
  return (
    <Container>
                <ImageContainer $role={commentCreatedBy?.role}>
                  <img
                    src={commentCreatedBy?.profileImage || "/default-profile.png"}
                    alt={`${commentCreatedBy?.name || "Anonymous"}'s profile image`}
                  />
                </ImageContainer>
                <Content>
                  <CardHeader>
                    <strong>{commentCreatedBy?.name || "Anonymous"}</strong>
                    <Dot>&middot;</Dot>
                    <span>{moment(createdAt).fromNow()}</span>
                  </CardHeader>
                </Content>
                {(user?.role === 'teacher' || isChecked) && (
                  <CheckBtn $checked={isChecked}>
                    <CircleCheckboxLabel>
                      <HiddenCheckbox
                        checked={isChecked}
                        onChange={() => handleToggleCheck(_id)}
                      />
                      <StyledCircle $checked={isChecked} />
                    </CircleCheckboxLabel>
                  </CheckBtn>
                )}
              </Container>
  )
};

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  gap: 15px;
  align-items: center;
`;

const ImageContainer = styled.div<{ $role?: string }>`
  flex-shrink: 0;
  height: 32px;
  width: 32px;
  border-radius: 50px;
  overflow: hidden;

  img { 
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Content = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({theme}) => theme.colors.textAlternative};
`;

const Dot = styled.span``;

export const CheckBtn = styled.div<{ $checked: boolean }>`
  opacity: ${({ $checked }) => ($checked ? '1' : '0')};
  visibility: ${({ $checked }) => ($checked ? 'visible' : 'hidden')};
  display: flex;
  column-gap: 10px;
  align-items: center;
  justify-content: center;
  width: 40px;
  cursor: pointer;
  transform: translatey(30%);
  transition: opacity 0.3s ease, visibility 0.3s ease, transform 0.3s ease;
`;