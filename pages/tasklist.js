import { getRemoteResponse } from "../lib/util/graphql"
import List from "../components/List"

function TaskList(props) {
  return <List items={props.items} />
}

TaskList.getInitialProps = async function() {
  const response = await getRemoteResponse(
    "http://localhost:3000/graphql",
    "{ taskList { id title text } }"
  )
  return { items: response.data.taskList }
}

export default TaskList
