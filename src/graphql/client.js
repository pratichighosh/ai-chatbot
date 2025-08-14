import { ApolloClient, InMemoryCache, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { getMainDefinition } from '@apollo/client/utilities'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { createClient } from 'graphql-ws'
import { nhost } from '../utils/nhost'

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_HASURA_GRAPHQL_URL,
})

// WebSocket link for subscriptions
const wsLink = new GraphQLWsLink(createClient({
  url: import.meta.env.VITE_HASURA_GRAPHQL_URL?.replace('https://', 'wss://').replace('http://', 'ws://') || '',
  connectionParams: () => {
    const token = nhost.auth.getAccessToken()
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
      },
    }
  },
}))

// Auth link with better error handling
const authLink = setContext((_, { headers }) => {
  const token = nhost.auth.getAccessToken()
  const user = nhost.auth.getUser()
  
  console.log('🔐 Auth Debug:', {
    hasToken: !!token,
    hasUser: !!user,
    userEmail: user?.email
  })
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
      'x-hasura-role': 'user',
    }
  }
})

// Split link for WebSocket subscriptions vs HTTP
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink),
)

export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
})