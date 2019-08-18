import List from "../components/List"
import fetch from "isomorphic-unfetch"

function TaskList(props) {
  return <List items={props.items} />
}

TaskList.getInitialProps = async function() {
  const res = await fetch("http://localhost:3000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify({ query: "{ task { id title text } }" })
  })
  const response = await res.json()

  return { items: response.data.task }
}

export default TaskList
