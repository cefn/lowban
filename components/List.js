export default props => (
  <ul>
    {props.items.map(item => (
      <li>
        <p>
          {item.id} : {item.title} : {item.text}
        </p>
      </li>
    ))}
  </ul>
)
