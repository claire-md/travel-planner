import Link from "next/link";

const HomePage = () => {
  return (
    <div>
      <h1>HomePage</h1>
      <ul>
        <li>
          <Link href="/login">Login</Link>
        </li>
        <li>
          <Link href="/signup">Signup</Link>
        </li>
      </ul>
    </div>
  );
};

export default HomePage;
