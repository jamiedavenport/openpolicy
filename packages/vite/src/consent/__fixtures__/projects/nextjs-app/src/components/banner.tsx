import { useCookies } from "react-cookie";

export function Banner() {
  const [, setCookie] = useCookies(["accepted"]);
  function acceptAll() {
    setCookie("accepted", "1", { path: "/" });
  }
  return <button onClick={acceptAll}>Accept</button>;
}
