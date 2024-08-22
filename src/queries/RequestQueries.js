import { gql } from '@apollo/client';

export const GET_ALL_REQUESTS = gql`
  query GetAllRequests {
    getAllRequests {
      data {
        id
        type
        userId
        status
        date
        duration
      }
      entityResponse {
        message
        status
        errors {
          field
          message
        }
      }
    }
  }
`;

export const GET_ALL_USER_REQUESTS = gql`
  query GetAllUserRequests {
    getAllUserRequests {
      data {
        id
        type
        userId
        status
        date
        duration
      }
      entityResponse {
        message
        status
        errors {
          field
          message
        }
      }
    }
  }
`;

export const CREATE_REQUEST = gql`
  mutation CreateRequest($request: RequestInput!) {
    createRequest(request: $request) {
      data {
        id
        type
        userId
        status
        date
        duration
      }
      entityResponse {
        message
        status
        errors {
          field
          message
        }
      }
    }
  }
`;

export const UPDATE_REQUEST = gql`
  mutation UpdateRequest($request: RequestInput!, $id: ID!) {
    updateRequest(request: $request, id: $id) {
      data {
        id
        type
        userId
        status
        date
        duration
      }
      entityResponse {
        message
        status
        errors {
          field
          message
        }
      }
    }
  }
`;

export const GET_ALL_USERS = gql`
  query GetAllUsers {
    getAllUsers {
      data {
        id
        firstName
        lastName
        email
        teleworkBalance
        leaveBalance
        profileDescription
        role
      }
      entityResponse {
        message
        status
        errors {
          field
          message
        }
      }
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUserById($id: ID!) {
    getUserById(id: $id) {
      data {
        id
        firstName
        lastName
      }
      entityResponse {
        message
        status
        errors {
          field
          message
        }
      }
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($id: ID!, $user: UserInput!) {
    updateUser(id: $id, user: $user) {
      data {
        id
        firstName
        lastName
        email
        teleworkBalance
        leaveBalance
        profileDescription
        role
      }
      entityResponse {
        message  
      }
    }
  }
`;
export const CREATE_USER = gql`
  mutation CreateUser($user: UserInput!) {
    createUser(user: $user) {
      data {
        id
        firstName
        lastName
        email
        teleworkBalance
        leaveBalance
        profileDescription
        role
      }
      entityResponse {
        message
      }
    }
  }
`;
export const DELETE_USER = gql`
mutation DeleteUser($id: ID!) {
  deleteUser(id: $id) {
    data {
      id
      firstName
      lastName
      email
      teleworkBalance
      leaveBalance
      profileDescription
      role
    }
    entityResponse {
      message  
    }
  }
}
`;