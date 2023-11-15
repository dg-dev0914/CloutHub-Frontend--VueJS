import {
  ApolloClient,
  ApolloLink, 
  Observable,
  InMemoryCache,
  HttpLink,
  from,
  split,
} from '@apollo/client/core';
import { getMainDefinition } from '@apollo/client/utilities';
import { onError } from '@apollo/client/link/error';
import axios from 'axios';
import { createClient } from 'graphql-ws';
import { print } from 'graphql/language/printer';


function getHeaders() {
  const isLogin = window.location.href.includes('/onboarding');
  if (localStorage.access_token && !isLogin) {
    return {
      Authorization: `Bearer ${localStorage.access_token}`,
    };
  }
  return {};
}

const httpLink = new HttpLink({
  uri: process.env.VUE_APP_GRAPH_ENDPOINT,
  headers: getHeaders(),
});

const wsClient = createClient({
  url: 'wss://graph8.clouthub.com/graphql',
  connectionParams: () => {
    return getHeaders();
  },
}); 

const wsLink = new ApolloLink(
  operation =>
    new Observable(observer => {
      const unsubscribe = wsClient.subscribe(
        { query: print(operation.query), variables: operation.variables },
        {
          next: observer.next.bind(observer),
          error: err => {
            // Only forward the error to the observer if it's not a CloseEvent with code 1002
            if (!(err instanceof CloseEvent && err.code === 1002)) {
              observer.error(err);
            }
          },
          complete: observer.complete.bind(observer),
        },
      );
      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }),
);

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const errorLink = onError((err) => {
  const payload = {};
  payload.token = localStorage.access_token;
  payload.app = 'desktop';
  payload.graphQLErrors =
    err.graphQLErrors && err.graphQLErrors.map((e) => e.message);
  if (err.networkError) {
    payload.networkError = {
      statusCode: err.networkError.statusCode,
      message: err.networkError.message,
    };
  }
  if (err.operation) {
    payload.operationName = err.operation.operationName;
    payload.variables = err.operation.variables;
    if (err.operation.query) {
      payload.querySrc = err.operation.query.loc.source.body;
    }
  }
  axios.post('https://graph8.clouthub.com/gqlerror', payload);
});

export default new ApolloClient({
  link: from([errorLink, splitLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Post: {
        keyFields: ['id'],
      },
      Translated: {
        keyFields: ['id'],
      },
      User: {
        keyFields: ['id', 'displayname'],
      },
    },
  }),
});
