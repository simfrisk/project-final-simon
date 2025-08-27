import { motion, AnimatePresence } from "framer-motion"
import styled from "styled-components"
import { MediaQueries } from "../../../../themes/mediaQueries"

interface TargetItemProps {
  title: string
  description: string
  index: number
  isOpen?: boolean
  onClick?: () => void
}

export const TargetItem = ({ title, description, index, isOpen, onClick }: TargetItemProps) => {
  return (
    <ListItem role="listitem">
      <HeaderButton
        onClick={onClick}
        aria-expanded={isOpen}
        aria-controls={`target-content-${index}`}
        aria-label={`${isOpen ? "Collapse" : "Expand"} ${title} details`}
      >
        <h3 id={`target-title-${index}`}>{title}</h3>
        <span aria-hidden="true">{isOpen ? "–" : "+"}</span>
      </HeaderButton>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.section
            id={`target-content-${index}`}
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
            aria-labelledby={`target-title-${index}`}
          >
            <motion.div
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -5, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <Content>{description}</Content>
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
    </ListItem>
  )
}

// ---------------- styled ----------------
const ListItem = styled.li`
  margin-bottom: 8px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.offBackground};
  background: ${({ theme }) => theme.colors.background};
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  list-style-type: none;
  margin-left: 0;
  padding-left: 0;
  width: 100%;

  @media ${MediaQueries.biggerSizes} {
    max-width: 800px;
  }
`

const HeaderButton = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 20px 28px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font-size: 20px;
  font-weight: 600;

  h3 {
    font-size: 24px;
    margin: 0;
    color: ${({ theme }) => theme.colors.text};
  }

  span {
    color: ${({ theme }) => theme.colors.textAlternative};
    font-size: 28px;
    font-weight: 400;
    line-height: 1;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.offBackgroundHover};
  }
`

const Content = styled.div`
  padding: 20px 28px;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textAlternative};
  line-height: 1.6;
`
