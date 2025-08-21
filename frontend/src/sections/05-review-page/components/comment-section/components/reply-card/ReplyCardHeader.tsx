import styled from "styled-components"
import moment from "moment"
import type { ReplyType } from "../../../../../../store/commentStore"

type ReplyCardHeaderProps = {
  reply: ReplyType
}

export const ReplyCardHeader = ({ reply }: ReplyCardHeaderProps) => {
  return (
    <Container>
      <ImageContainer onClick={() => console.log(reply._id)}>
        <img
          src={reply.replyCreatedBy?.profileImage || "/default-profile.png"}
          aria-label={`View profile of ${reply.replyCreatedBy?.name || "Anonymous"}`}
        />
      </ImageContainer>
      <Content>
        <CardHeader>
          <strong>{reply.replyCreatedBy?.name || "Anonymous"}</strong>
          <Dot aria-hidden="true">&middot;</Dot>
          <span aria-label="Shows when posted">
            {moment(reply.createdAt).fromNow()}
          </span>
        </CardHeader>
      </Content>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  gap: 15px;
  align-items: center;
`

const ImageContainer = styled.div`
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
`

const Content = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme }) => theme.colors.textAlternative};
`

const Dot = styled.span``

export const CheckBtn = styled.div`
  opacity: 0;
  visibility: hidden;
  display: flex;
  column-gap: 10px;
  align-items: center;
  justify-content: center;
  width: 40px;
  cursor: pointer;
  transform: translatey(30%);
  transition:
    opacity 0.3s ease,
    visibility 0s linear 0.3s,
    transform 0.3s ease;
`
