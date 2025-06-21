import styled from 'styled-components';

export const DescriptionSection = () => {
  return (
    <CommentListContainer>
      <h3>Description title</h3>
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde cupiditate quas aperiam quo magni fugit, eligendi assumenda hic harum iste, vitae fuga ullam voluptatibus cumque enim? Delectus, sunt velit modi similique consectetur id doloribus ea quae! Quaerat rem quibusdam temporibus vitae? Debitis quia assumenda exercitationem voluptatum quibusdam in eius provident.
      </p>

      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati blanditiis dolores voluptatum nam alias magnam adipisci, sit dicta. Libero amet deleniti ducimus ut dolor, rem cumque nihil voluptatibus sit doloribus!</p>


      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Obcaecati blanditiis dolores voluptatum nam alias magnam adipisci, sit dicta. Libero amet deleniti ducimus ut dolor, rem cumque nihil voluptatibus sit doloribus!</p>
    </CommentListContainer>
    
  );
};


const CommentListContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 0 16px;
  width: 100%;
  background-color: #f5f5f5;
`;

