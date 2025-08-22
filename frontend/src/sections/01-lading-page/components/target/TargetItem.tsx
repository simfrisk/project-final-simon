import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import styled from "styled-components"

interface TargetItemProps {
  title: string
  description: string
}

export const TargetItem = ({ title, description }: TargetItemProps) => {
  const [open, setOpen] = useState(false)

  return (
    <ListItem>
      <HeaderButton
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <h3>{title}</h3>
        <span>{open ? "–" : "+"}</span>
      </HeaderButton>

      <AnimatePresence initial={false}>
        {open && (
          <motion.section
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
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
  margin-bottom: 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.offBackground};
  background: ${({ theme }) => theme.colors.background};
  box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.08);
  list-style-type: none;
  margin-left: 0;
  padding-left: 0;
`

const HeaderButton = styled.button`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 14px 20px;
  border: none;
  background: none;
  cursor: pointer;
  text-align: left;
  font-size: 18px;
  font-weight: 600;

  h3 {
    margin: 0;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.offBackgroundHover};
  }
`

const Content = styled.div`
  padding: 12px 20px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textAlternative};
  line-height: 1.5;
`
