import { useCookies } from "react-cookie";

export function Banner() {
  const [cookies, setCookie] = useCookies(["consent"]);
  void cookies;
  return <button onClick={() => setCookie("consent", "yes", { path: "/" })}>OK</button>;
}
