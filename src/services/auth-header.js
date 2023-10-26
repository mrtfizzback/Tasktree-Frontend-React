export default function authHeader() {
  const user = JSON.parse(localStorage.getItem("JWTtoken"));

  if (user) {
    return { Authorization: "Bearer " + JWTtoken }; // for Spring Boot back-end
    // return { 'x-access-token': user.accessToken };       // for Node.js Express back-end
  } else {
    return {};
  }
}
