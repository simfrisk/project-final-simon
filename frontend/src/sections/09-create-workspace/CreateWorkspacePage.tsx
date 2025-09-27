import { Navigation } from "../../global-components/navigation/Navigation"
import { CreateWorkspaceHeader } from "./components/CreateWorkspaceHeader"
import { CreateWorkspaceForm } from "./components/CreateWorkspaceForm"

export const CreateWorkspacePage = () => {
  return (
    <>
      <Navigation />
      <CreateWorkspaceHeader />
      <CreateWorkspaceForm />
    </>
  )
}
