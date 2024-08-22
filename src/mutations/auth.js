import { gql } from "@apollo/client";
export const login = gql`
mutation login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
  data
  entityResponse{
      message
      status
  }
  }
}
`;