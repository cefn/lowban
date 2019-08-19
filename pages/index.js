import Link from "next/link"

const Index = () => (
  <div>
    <Link href="/edit">
      <a>Edit</a>
    </Link>
    <Link href="/tasklist">
      <a>List Tasks</a>
    </Link>
  </div>
)

export default Index
